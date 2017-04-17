import {icon} from 'leaflet'
import React, {Component, PropTypes} from 'react'
import {Map, Marker, TileLayer} from 'react-leaflet'
import {withRouter} from 'react-router'

import Legend from './legend'

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
          center={[37.062, -122.005]}
          onClick={this._onMapClick}
          zoom={11}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          {developments.map((development) =>
            <Marker
              development={development}
              icon={getMarkerIcon(development)}
              key={`marker-${development.id}`}
              onClick={this._onMarkerClick}
              position={development.geom.coordinates}
              title={development.data.name}
              />
          )}
          <Legend
            collapsedHTML={collapsedLegendHTML}
            fullHTML={fullLegendHTML}
            position='bottomright'
            />
        </Map>
      </div>
    )
  }
}

export default withRouter(DevelopmentMap)

const collapsedLegendHTML = '<div class="map-legend"><h4>Legend<i class="fa fa-caret-square-o-up fa-fw pull-right"></i></button></h4></div>'

const defaultIconCfg = {
  iconSize: [32, 37],
  iconAnchor: [16, 37]
}

const fullLegendHTML = '<div class="map-legend"><h4>Legend<i class="fa fa-caret-square-o-down fa-fw pull-right"></i></h4><table><tbody>'

function getMarkerIcon (development) {
  const statusesLength = development.data.statuses.length
  if (statusesLength === 0 ||
    (['Application Submitted', 'Permits Issued', 'Under Construction', 'Completed'])
      .indexOf(development.data.statuses[0].type) === -1) return mapIcons['?']
  return mapIcons[development.data.statuses[0].type]
}

const iconHost = process.env.STATIC_HOST

const mapIcons = {
  '?': icon(Object.assign({
    iconUrl: `${iconHost}unknown-status.png`,
  }, defaultIconCfg)),
  'Application Submitted': icon(Object.assign({
    iconUrl: `${iconHost}contract.png`,
  }, defaultIconCfg)),
  'Permits Issued': icon(Object.assign({
    iconUrl: `${iconHost}gavel-auction-fw.png`,
  }, defaultIconCfg)),
  'Under Construction': icon(Object.assign({
    iconUrl: `${iconHost}constructioncrane.png`,
  }, defaultIconCfg)),
  'Completed': icon(Object.assign({
    iconUrl: `${iconHost}office-building.png`,
  }, defaultIconCfg)),
}

const statuses = [{
  iconUrl: 'contract.png',
  text: 'Application Submitted'
}, {
  iconUrl: 'gavel-auction-fw.png',
  text: 'Permits Issued'
}, {
  iconUrl: 'constructioncrane.png',
  text: 'Under Construction'
}, {
  iconUrl: 'office-building.png',
  text: 'Completed'
}]
statuses.forEach((status) => {
  fullLegendHTML += `<tr><td><img src="${iconHost}${status.iconUrl}"/></td><td>${status.text}</td></tr>`
})
fullLegendHTML += '</tbody></table>'
fullLegendHTML += '<p>Icons by <a href="https://mapicons.mapsmarker.com/">Maps Icons Collection</a>.</p></div>'
