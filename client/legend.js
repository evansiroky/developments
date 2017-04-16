import {control, DomUtil} from 'leaflet'
import {PropTypes} from 'react'

import MapControl from 'react-leaflet/lib/MapControl'

export default class Legend extends MapControl {
  static propTypes = {
    collapsedHTML: PropTypes.string,
    fullHTML: PropTypes.string,
    position: PropTypes.string
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.collapsedHTML !== this.props.collapsedHTML) {
      this.collapsedHTML = nextProps.collapsedHTML
      if (this.collapsed) this.div.innerHTML = this.collapsedHTML
    }
    if (nextProps.fullHTML !== this.props.fullHTML) {
      this.fullHTML = nextProps.fullHTML
      if (!this.collapsed) this.div.innerHTML = this.fullHTML
    }
  }

  createLeafletElement (props) {
    const legend = control({ position: props.position })
    this.collapsedHTML = props.collapsedHTML
    this.fullHTML = props.fullHTML
    this.collapsed = false
    this.div = DomUtil.create('div', 'legend')
    this.div.addEventListener('click', () => {
      this.collapsed = !this.collapsed
      if (this.collapsed) {
        this.div.innerHTML = this.collapsedHTML
      } else {
        this.div.innerHTML = this.fullHTML
      }
    })
    legend.onAdd = (map) => {
      this.div.innerHTML = this.fullHTML
      return this.div
    }
    return legend
  }
}
