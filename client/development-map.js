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

  _onMarkerClick = (e) => {
    ga('send', 'event', {
      eventCategory: 'Development',
      eventAction: 'View',
      eventLabel: 'Map Marker Click'
    })
    this.props.router.history.push(`/development/${e.target.options.development.id}`)
  }

  _onMapClick = (e) => {
    const {auth, create, router} = this.props
    if (auth.isAdmin()) {
      create({
        geom: {
          coordinates: [e.latlng.lat, e.latlng.lng],
          type: 'Point'
        }
      })
        .then((development) => {
          router.history.push(`/development/${development.id}`)
        })
    }
  }

  _updateDimensions = () => {
    const mapHeight = window.innerHeight - 52
    this.setState({ mapHeight })
  }

  render () {
    const {developments} = this.props
    return (
      <div style={{height: this.state.mapHeight}}>
        <Map
          center={[37.062716, -122.005770]}
          onClick={this._onMapClick}
          zoom={13}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          {developments.map((development) =>
            <Marker
              development={development}
              key={`marker-${development.id}`}
              onClick={this._onMarkerClick}
              position={development.geom.coordinates}
              title={development.data.name}
              />
          )}
        </Map>
      </div>
    )
  }
}

export default withRouter(DevelopmentMap)
