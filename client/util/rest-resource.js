
require('isomorphic-fetch')

export default class RestResource {
  constructor (endpointName) {
    this.endpointName = endpointName
  }

  _genericRequest (url, options) {
    return fetch(url, {
      ...options,
      ...this.createAuthorizationHeader()
    })
      .then((response) => {
        if (response.status >= 400) {
          throw response
        }
        return response.json()
      })
      .catch((err) => {
        console.error(err)
        alert('An error occured.  Please try again later')
      })
  }

  collectionGet () {
    return this._genericRequest(`/api/${this.endpointName}s`)
  }

  collectionPost (data) {
    return this._genericRequest(`/api/${this.endpointName}s`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }

  createAuthorizationHeader () {
    return this.idToken
      ? {Authorization: `bearer ${this.idToken}`}
      : {}
  }

  delete (id) {
    return this._genericRequest(`/api/${this.endpointName}/${id}`, {
      method: 'DELETE'
    })
  }

  put (data) {
    return this._genericRequest(`/api/${this.endpointName}/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }
}
