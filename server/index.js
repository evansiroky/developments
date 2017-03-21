const path = require('path')

const bodyParser = require('body-parser')
const epilogue = require('epilogue')
const express = require('express')
const html = require('@conveyal/woonerf/html')

const db = require('./models')

const app = express()

app.set('port', (process.env.PORT || 5000))

// static assets
app.use('/assets', express.static(path.resolve(__dirname, '../assets')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

epilogue.initialize({
  app: app,
  base: '/api',
  sequelize: db.sequelize
})

const developmentResource = epilogue.resource({
  model: db.development,
  endpoints: ['/developments', '/development/:id']
})

// webapp
app.get('*', (req, res) => {
  res.status(200).type('html').send(html({staticHost: '/', title: 'Santa Cruz Developments'}))
})

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'))
})

module.exports = app
