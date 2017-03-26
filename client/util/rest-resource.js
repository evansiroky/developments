
require('isomorphic-fetch')

export default class RestResource {
  constructor (endpointName) {
    this.endpointName = endpointName
  }

  _genericRequest (url, options) {
    return fetch(url, options)
      .then((response) => {
        return response.json()
      })
      .catch((err) => {
        console.error(err)
        alert('An error occured.  Please try again later')
      })
  }

  collectionGet () {
    return this._genericRequest(`/api/${this.endpointName}s`)
      .then((data) => {
        // TODO: find a better way to handle geom crs
        return data.map((record) => {
          if (record.geom) {
            record.geom.crs = { type: 'name', properties: { name: 'EPSG:4326'} }
          }
          return record
        })
      })
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
