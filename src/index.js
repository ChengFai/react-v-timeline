import React from "react";
import PropTypes from 'prop-types';

import { DataSet, Timeline } from "vis-timeline/standalone";
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import moment from 'moment';
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import each from 'lodash/each'
import assign from 'lodash/assign'
import omit from 'lodash/omit'
import keys from 'lodash/keys'
import isEqual from 'lodash/isEqual'

const noop = function() {}
const events = [
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

const eventPropTypes = {}
const eventDefaultProps = {}

events.forEach(event => {
  eventPropTypes[event] = PropTypes.func ;
  eventDefaultProps[`${event}Handler`] = noop
})

export default class Timeline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customTimes: [],
    }
    this.containerRef = React.createRef()
  }

  componentWillUnmount() {
    this.$el.destroy()
  }

  componentDidMount() {
    this.$el = new Timeline(
      this.containerRef.current, undefined, this.props.options)

    events.forEach(event => {
      this.$el.on(event, this.props[`${event}Handler`])
    })

    this.init()
  }

  componentDidUpdate() {
    this.init()
  }

  shouldComponentUpdate(nextProps) {
    const { items, groups, options, selection, customTimes } = this.props

    const itemsChange = !isEqual(items, nextProps.items)
    const groupsChange = !isEqual(groups, nextProps.groups)
    const optionsChange = !isEqual(options, nextProps.options)
    const customTimesChange = !isEqual(customTimes, nextProps.customTimes)
    const selectionChange = !isEqual(selection, nextProps.selection)

    return (
      itemsChange ||
      groupsChange ||
      optionsChange ||
      customTimesChange ||
      selectionChange
    )
  }

  init() {
    const {
      items,
      groups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
      animate = true,
      currentTime,
    } = this.props

    let timelineOptions = options

    if (animate) {
      // If animate option is set, we should animate the timeline to any new
      // start/end values instead of jumping straight to them
      timelineOptions = omit(options, 'start', 'end')

      this.$el.setWindow(options.start, options.end, {
        animation: animate,
      })
    }

    this.$el.setOptions(timelineOptions)

    if (groups.length > 0) {
      const groupsDataset = new DataSet()
      groupsDataset.add(groups)
      this.$el.setGroups(groupsDataset)
    }

    this.$el.setItems(items)
    this.$el.setSelection(selection, selectionOptions)

    if (currentTime) {
      this.$el.setCurrentTime(currentTime)
    }

    // diff the custom times to decipher new, removing, updating
    const customTimeKeysPrev = keys(this.state.customTimes)
    const customTimeKeysNew = keys(customTimes)
    const customTimeKeysToAdd = difference(
      customTimeKeysNew,
      customTimeKeysPrev
    )
    const customTimeKeysToRemove = difference(
      customTimeKeysPrev,
      customTimeKeysNew
    )
    const customTimeKeysToUpdate = intersection(
      customTimeKeysPrev,
      customTimeKeysNew
    )

    // NOTE this has to be in arrow function so context of `this` is based on
    // this.$el and not `each`
    each(customTimeKeysToRemove, id => this.$el.removeCustomTime(id))
    each(customTimeKeysToAdd, id => {
      const datetime = customTimes[id]
      this.$el.addCustomTime(datetime, id)
    })
    each(customTimeKeysToUpdate, id => {
      const datetime = customTimes[id]
      this.$el.setCustomTime(datetime, id)
    })

    // store new customTimes in state for future diff
    this.setState({ customTimes })
  }

  render() {
    return <div ref= {this.containerRef} />
  }
}

Timeline.propTypes = assign(
  {
    items: PropTypes.array,
    groups: PropTypes.array,
    options: PropTypes.object,
    selection: PropTypes.array,
    customTimes: PropTypes.shape({
      datetime: PropTypes.instanceOf(Date),
      id: PropTypes.string,
    }),
    animate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    currentTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.number,
    ]),
  },
  eventPropTypes
)

Timeline.defaultProps = assign(
  {
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {},
  },
  eventDefaultProps
)