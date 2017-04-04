import Auth0Lock from 'auth0-lock'

export default class AuthService {
  constructor(clientId, domain, restResources=[]) {
    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, {
      auth: {
        redirect: false
      },
      autoclose: true
    })

    // remember rest resources
    this.restResources = restResources

    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', this._doAuthentication.bind(this))
    // binds login functions to keep this context
    this.login = this.login.bind(this)
  }

  _doAuthentication(authResult) {
    // Saves the user token
    this.setToken(authResult.idToken)
    // Set id token in all rest resources
    this.restResources.forEach((resource) => {
      resource.idToken = authResult.idToken
    })

    // get profile data
    this.lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) return
      this.profile = profile
    })
  }

  login() {
    // Call the show method to display the widget.
    this.lock.show()
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    return !!this.getToken()
  }

  setToken(idToken) {
    // Saves user token to local storage
    localStorage.setItem('id_token', idToken)
  }

  getToken() {
    // Retrieves the user token from local storage
    return localStorage.getItem('id_token')
  }

  logout() {
    // Clear user token and profile data from local storage
    localStorage.removeItem('id_token')
  }
}
