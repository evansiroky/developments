import React, {Component, PropTypes} from 'react'
import {Map, Marker, TileLayer} from 'react-leaflet'
import {withRouter} from 'react-router'

class DevelopmentMap extends Component {
  static propTypes = {
    router: PropTypes.object.isRequired
  }

  // ------------------------------------------------------------------------
  // Lifecycle fns
  // ------------------------------------------------------------------------

  componentDidMount () {
    window.addEventListener('resize', this._updateDimensions)
  }

  componentWillMount () {
    this._updateDimensions()
  }

  // ------------------------------------------------------------------------
  // handler fns
  // ------------------------------------------------------------------------

  _handleMarkerClick = (e) => {
    this.props.router.history.push(`/development/${e.target.options.development.id}`)
  }

  _updateDimensions = () => {
    const mapHeight = window.innerHeight - 52
    this.setState({ mapHeight })
  }

  render () {
    const {developments} = this.props
    return (
      <div style={{height: this.state.mapHeight}}>
        <Map center={[37.062716, -122.005770]} zoom={13}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          {developments.map((development) =>
            <Marker
              development={development}
              key={`marker-${development.name}`}
              onClick={this._handleMarkerClick}
              position={development.position}
              />
          )}
        </Map>
      </div>
    )
  }
}

export default withRouter(DevelopmentMap)
