
import {List} from 'immutable'
import React, {Component} from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Redirect, Route} from 'react-router-dom'

import Development from './development'
import DevelopmentMap from './development-map.js'
import RestResource from './util/rest-resource'

const developmentsResource = new RestResource('development')

class App extends Component {
  state = {
    developments: [],
    navCollapsed: true
  }

  // ------------------------------------------------------------------------
  // Lifecycle fns
  // ------------------------------------------------------------------------

  componentWillMount () {
    developmentsResource.collectionGet()
      .then((data) => {
        this.setState({developments: List(data)})
      })
  }

  // ------------------------------------------------------------------------
  // handler fns
  // ------------------------------------------------------------------------

  _onToggleNav = () => {
    this.setState({ navCollapsed: !this.state.navCollapsed })
  }

  // ------------------------------------------------------------------------
  // internal fns
  // ------------------------------------------------------------------------

  _findDevelopment = (developmentId) => {
    developmentId += ''
    return this.state.developments.find((development) => '' + development.id === developmentId)
  }

  _findDevelopmentIdx = (developmentId) => {
    return this.state.developments.findIndex((development) => '' + development.id === developmentId)
  }

  // ------------------------------------------------------------------------
  // model fns
  // ------------------------------------------------------------------------

  _createDevelopment = (newData) => {
    const {developments} = this.state
    return developmentsResource.collectionPost(newData)
      .then((newDevelopment) => {
        this.setState({
          developments: developments.push(newDevelopment)
        })
        return newDevelopment
      })
  }

  _updateDevelopment = (data) => {
    const {developments} = this.state
    return developmentsResource.put(data)
      .then((data) => {
        this.setState({
          developments: developments.set(this._findDevelopmentIdx(data.id), data)
        })
        return data
      })
  }

  deleteDevelopment = (developmentId) => {
    const {developments} = this.state
    let developmentIdx
    developmentsResource.delete(developmentId)
      .then(() => {
        this.setState({
          developments: developments.unshift(developmentIdx)
        })
      })
    developmentIdx = this._findDevelopmentIdx(developmentId)
  }

  render () {
    const {developments, navCollapsed} = this.state

    return (
      <Router>
        <div>
          <nav className='navbar navbar-default' style={{marginBottom: 0}}>
            <div className='navbar-header'>
              <a className='navbar-brand' href='/'>Santa Cruz Developments</a>
              <button
                aria-expanded='false'
                className='navbar-toggle collapsed'
                onClick={this._onToggleNav}
                type='button'
                >
                <span className='sr-only'>Toggle navigation</span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
                <span className='icon-bar'></span>
              </button>
            </div>
            <div
              className={(navCollapsed ? 'collapse' : '') + ' navbar-collapse'}
              >
              <ul className='nav navbar-nav navbar-right'>
                <li>
                  <a>About</a>
                </li>
              </ul>
            </div>
          </nav>
          <DevelopmentMap
            create={this._createDevelopment}
            developments={developments}
            />
          <Route path='/development/:id' render={({match}) => {
            if (developments.length === 0) return null
            const selectedDevelopment = this._findDevelopment(match.params.id)
            if (selectedDevelopment) {
              return (
                <Development
                  create={this._createDevelopment}
                  delete={this._deleteDevelopment}
                  development={selectedDevelopment}
                  update={this._updateDevelopment}
                  />
              )
            } else {
              return <Redirect to='/' />
            }
          }} />
        </div>
      </Router>
    )
  }
}

render(<App />, document.getElementById('root'))
