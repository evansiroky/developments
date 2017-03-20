const path = require('path')

const express = require('express')
const html = require('@conveyal/woonerf/html')

const app = express()

app.set('port', (process.env.PORT || 5000))

// static assets
app.use('/assets', express.static(path.resolve(__dirname, '../assets')))

// webapp
app.get('*', (req, res) => {
  res.status(200).type('html').send(html({staticHost: '/', title: 'Santa Cruz Developments'}))
})

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'))
})

module.exports = app
