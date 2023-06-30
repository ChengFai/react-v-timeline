import React from "react";
import PropTypes from 'prop-types';

import { DataSet, Timeline } from "vis-timeline/standalone";
import moment from 'moment';

import "vis-timeline/styles/vis-timeline-graph2d.css";

const eventsType = [
    'currentTimeTick',
    'click',
    'contextmenu',
    'doubleClick',
    'dragOver',
    'drop',
    'mouseDown',
    'mouseMove',
    'mouseUp',
    'mouseOver',
    'groupDragged',
    'changed',
    'rangechange',
    'rangechanged',
    'select',
    'itemover',
    'itemout',
    'timechange',
    'timechanged',
    'markerchange',
    'markerchanged',
]

class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: null,
            groups: [],
            options: {},
            locale: "en",
            timezones:"UTC",
            styles: {},
            onRenderComplete: () => { },
        };
        this.eventsType = eventsType;
        this.containerRef = React.createRef();
        this.instance = null;
        this.renderCompleteHandler = this.renderCompleteHandler.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { items, groups, options, locale, timezones, styles, onRenderComplete } = nextProps;
        const _items = new DataSet(items);
        return {
            items: _items,
            groups,
            options,
            locale,
            timezones,
            styles,
            onRenderComplete,
        };
    }

    renderCompleteHandler(callback) {
        // StackOverflow: https://stackoverflow.com/questions/34535989/getting-a-callback-after-visjs-finishes-loading-chart
        // The visualizations of vis.js should load synchronously so there is no need for a callback.
        if (typeof callback === 'function') {
            let timer = setTimeout(() => {
                callback(this.instance);
                clearTimeout(timer);
            }, 0);
        }
    }

    componentDidMount() {
        const { groups, options, items } = this.state;
        const _items = new DataSet(items);
        const containerDom = this.containerRef.current;
        if(!containerDom) {
            console.error("Timeline container is not defined");
            return;
        } else if(!groups) {
            this.instance = new Timeline(containerDom, _items, options);
        } else {
            this.instance = new Timeline(containerDom, _items, groups, options);
        }
        this.renderCompleteHandler(this.state.onRenderComplete);
    }

    render() {
        return (
            <div ref={this.containerRef} style={this.styles} />
        );
    }
}

export default Timeline;