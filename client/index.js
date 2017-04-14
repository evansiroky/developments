(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga')

ga('create', process.env.GOOGLE_ANALYTICS_TRACKING_ID, 'auto')
ga('send', 'pageview')

import React, {Component} from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Redirect, Route} from 'react-router-dom'

import Development from './development'
import DevelopmentMap from './development-map.js'
import AuthService from './util/auth-service'
import RestResource from './util/rest-resource'

const developmentsResource = new RestResource('development')
const auth = new AuthService(process.env.AUTH0_CLIENT_ID, process.env.AUTH0_DOMAIN, [developmentsResource])

class App extends Component {
  state = {
    developments: [],
    loadingDevelopments: true,
    navCollapsed: true
  }

  // ------------------------------------------------------------------------
  // Lifecycle fns
  // ------------------------------------------------------------------------

  componentWillMount () {
    developmentsResource.collectionGet()
      .then((data) => {
        this.setState({developments: data, loadingDevelopments: false})
      })
  }

  // ------------------------------------------------------------------------
  // handler fns
  // ------------------------------------------------------------------------

  _onLoginClick = () => {
    auth.login()
  }

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
        if (!newDevelopment) return
        developments.push(newDevelopment)
        this.setState({ developments })
        return newDevelopment
      })
  }

  _updateDevelopment = (data) => {
    const {developments} = this.state
    return developmentsResource.put(data)
      .then((data) => {
        if (!data) return
        developments[this._findDevelopmentIdx(data.id)] = data
        this.setState({ developments })
        return data
      })
  }

  _deleteDevelopment = (developmentId) => {
    const {developments} = this.state
    let developmentIdx
    developmentsResource.delete(developmentId)
      .then((data) => {
        if (!data) return
        developments.splice(developmentIdx, 1)
        this.setState({ developments })
      })
    developmentIdx = this._findDevelopmentIdx(developmentId)
  }

  render () {
    const {developments, loadingDevelopments, navCollapsed} = this.state

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
                <li><a onClick={this._onLoginClick}>Login</a></li>
              </ul>
            </div>
          </nav>
          <DevelopmentMap
            auth={auth}
            create={this._createDevelopment}
            developments={developments}
            />
          <Route path='/development/:id' render={({match}) => {
            if (loadingDevelopments) return null
            if (developments.length === 0) return <Redirect to='/' />
            const selectedDevelopment = this._findDevelopment(match.params.id)
            if (selectedDevelopment) {
              return (
                <Development
                  auth={auth}
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
