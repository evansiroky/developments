
import mount from '@conveyal/woonerf/mount'
import React, {Component} from 'react'
import {Nav, Navbar, NavItem} from 'react-bootstrap'
import {Map, Marker, TileLayer} from 'react-leaflet'
import Modal from 'react-modal'
import {BrowserRouter as Router, Route} from 'react-router-dom'

class App extends Component {
  state = {
    developments: [{
      name: 'Sprawl',
      position: [37.066111, -121.990876]
    }, {
      name: 'Townhomes',
      position: [37.052976, -122.013837]
    }]
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

  _handleDevelopmentClose = (e) => {

  }

  _handleMarkerClick = (e) => {
    console.log(e)
  }

  _updateDimensions = () => {
    const mapHeight = window.innerHeight - 52
    this.setState({ mapHeight })
  }

  render () {
    const {developments} = this.state
    return (
      <Router>
        <div>
          <Navbar collapseOnSelect style={{marginBottom: 0}}>
            <Navbar.Header>
              <Navbar.Brand>Santa Cruz Developments</Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                <NavItem eventKey={1}>About</NavItem>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <div style={{height: this.state.mapHeight}}>
            <Map center={[37.062716, -122.005770]} zoom={13}>
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
              />
              {developments.map((development) =>
                <Marker
                  key={`marker-${development.name}`}
                  onClick={this._handleMarkerClick}
                  position={development.position}
                  />
              )}
            </Map>
          </div>
          <Route path='/development/:id' render={(params) => {
            const selectedDevelopment = developments.find((development) => development.id === params.id)
            return (
              <Modal
                contentLabel={selectedDevelopment.name}
                isOpen
                onRequestClose={this._handleDevelopmentClose}
                >
                <p>Lorem ipsum dumpty dum</p>
              </Modal>
            )
          }} />
        </div>
      </Router>
    )
  }
}

mount({
  app: App,
  id: 'root'
})
