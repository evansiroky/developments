
require('isomorphic-fetch')
import React, {Component} from 'react'
import {Nav, Navbar, NavItem} from 'react-bootstrap'
import {render} from 'react-dom'
import {BrowserRouter as Router, Route} from 'react-router-dom'

import Development from './development'
import DevelopmentMap from './development-map.js'

class App extends Component {
  state = {
    developments: []
  }

  // ------------------------------------------------------------------------
  // Lifecycle fns
  // ------------------------------------------------------------------------

  componentWillMount () {
    fetch('api/developments')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        this.setState({developments: data})
      })
      .catch((err) => {
        alert('Could not load data.  Please try again later.')
      })
  }

  // ------------------------------------------------------------------------
  // handler fns
  // ------------------------------------------------------------------------

  _handleDevelopmentClose = (e) => {
    console.log('close please')
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
          <DevelopmentMap developments={developments} />
          <Route path='/development/:id' render={({match}) => {
            const selectedDevelopment = developments.find((development) =>
              development.id === match.params.id
            )
            if (selectedDevelopment) {
              return <Development development={selectedDevelopment} />
            }
          }} />
        </div>
      </Router>
    )
  }
}

// const RoutedApp = withRouter(App)

// render(<RoutedApp />, document.getElementById('root'))

render(<App />, document.getElementById('root'))
