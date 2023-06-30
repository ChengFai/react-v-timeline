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
            items: new DataSet([]),
            groups: [],
        };
        this.locale = locale(this.props.locale || 'en')
        this.timezone = this.props.timezone || 'UTC';
        this.options = {
            moment: (date) => {
                moment.locale(this.locale);
                if (this.timezone.toUpperCase() === 'UTC' || 
                    this.timezone.toUpperCase() === 'GMT') {
                    return moment(date).utc();
                } else {
                    return moment(date).utcOffset(this.timezone);
                }
            },
            
        }
        this.eventsType = 
        this.styles = this.props.styles || {};
        this.containerRef = React.createRef();
        this.instance = null;
    }

    getDerivedStateFromProps(nextProps, prevState) {

    }

    componentDidMount() {
        const { groups, options, items } = this.state;
        const _items = new DataSet(items);
        const containerDom = this.containerRef.current;
        this.instance = new Timeline(containerDom, _items, groups, options);
    }

    render() {
        return (
            <div ref={this.containerRef} style={this.styles} />
        );
    }
}

export default Timeline;