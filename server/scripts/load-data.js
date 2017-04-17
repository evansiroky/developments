const fs = require('fs')

const queue = require('async/queue')
const csv = require('csv')
const search = require('isomorphic-mapzen-search').search
const isEqual = require('lodash.isequal')

const environment = require('../util/env')
const env = environment.env
const settings = environment.settings
const db = require('../models')

function now () {
  return (new Date()).getTime()
}

let lastRequestTime = 0
const geocodeRequestQueue = queue((task, callback) => {
  setTimeout(() => {
    lastRequestTime = now()
    task(callback)
  }, Math.max(0, 600 - (now() - lastRequestTime))) // wait at least 0.5 second between requests
}, 2)

const argv = require('yargs')
  .usage('Usage: $0')
  .demandCommand(1)
  .argv

// check existance of file
const fileName = argv._[0]
if (!fs.existsSync(fileName)) throw new Error(`File not found: ${fileName}`)

// ensure enough csv column headers
const requiredColumns = [
  'jurisdiction_id',
  'parcel_id',
  'address'
]

const statusTypes = [{
  csvField: 'applied_date',
  name: 'Application Submitted'
}, {
  csvField: 'approved_date',
  name: 'Permits Issued'
}, {
  csvField: 'construction_date',
  name: 'Under Construction'
}, {
  csvField: 'completion_date',
  name: 'Completed'
}]

parser = csv.parse({
  columns: true,
  relax: true
})

// parse data
const input = fs.createReadStream(fileName)

let columnsChecked = false
let numRows = 0
let numCreated = 0
let numUpdated = 0
let numErrors = 0
let numProcessed = 0

parser.on('readable', () => {
  while(development = parser.read()) {
    if (!columnsChecked) {
      requiredColumns.forEach((column) => {
        if (!development[column]) throw new Error(`Missing required column "${column}"`)
      })
      columnsChecked = true
    }

    numRows++

    // set defaults
    const statuses = []
    statusTypes.forEach((statusType) => {
      if (development[statusType.csvField]) {
        statuses.push({
          date: development[statusType.csvField],
          type: statusType.name
        })
      }
    })
    statuses.reverse()
    const serializedDevelopment = {
      jurisdiction_id: development.jurisdiction_id,
      parcel_id: development.parcel_id,
      data: {
        description: development.description || 'No description... yet.',
        name: development.address,
        statuses,
        website: development.website
      },
      geom: {
        coordinates: [development.lat, development.lon],
        crs: { type: 'name', properties: { name: 'EPSG:4326'} },
        type: 'Point'
      }
    }

    findOrCreateDevelopment(serializedDevelopment)
  }
})

parser.on('end', () => {
  if (numRows === 0) {
    throw new Error('No data in this csv file')
  }
  checkIfDone()
})

input.pipe(parser)

function checkIfDone () {
  if (numRows !== numProcessed) {
    return setTimeout(checkIfDone, 100)
  }
  console.log(`${numRows} rows of developments in file`)
  console.log(`${numErrors} errors`)
  console.log(`${numProcessed} rows processed`)
  console.log(`${numCreated} developments created`)
  console.log(`${numUpdated} developments updated`)
}

function findOrCreateDevelopment (development) {
  db
    .development
    .findOne({
      where: {
        jurisdiction_id: development.jurisdiction_id,
        parcel_id: development.parcel_id
      }
    })
    .then((existingDevelopment) => {
      if (!existingDevelopment) {
        // new development, add to db
        createDevelopment(development)
      } else {
        updateDevelopmentIfNeeded(development, existingDevelopment)
      }
    })
}

function createDevelopment (development) {
  function createdCallback () {
    console.log(`Created ${development.data.name}`)
    numCreated++
    numProcessed++
  }

  if (!development.geom.coordinates[0]) {
    // geocode development
    geocodeRequestQueue.push((queueCallback) => {
      let numTries = 0
      function doGeocodeUntilSuccess () {
        numTries++
        search({
          apiKey: env.MAPZEN_KEY,
          text: development.data.name,
          boundary: {
            country: 'US',
            rect: settings.GEOCODE_BOUNDS
          }
        }).then((geojson) => {
          if (!geojson || !geojson.features) {
            if (numTries < maxRetries) {
              const secondsToWait = Math.pow(2, numTries)
              console.log(`wait ${secondsToWait} seconds before retrying ${development.data.name}`)
              setTimeout(doGeocodeUntilSuccess, secondsToWait * 1000)
            } else {
              console.error(`Geocoding failed for ${development.data.name} after 5 tries!`)
              queueCallback(err)
            }
          } else if (geojson.features.length === 0) {
            numErrors++
            numProcessed++
            console.log(geojson)
            console.error(`No geocode results found for: ${development.data.name}`)
          } else {
            queueCallback()
            development.geom.coordinates = geojson.features[0].geometry.coordinates.reverse()
            db.development.create(development)
              .then(createdCallback)
          }
        })
      }
      doGeocodeUntilSuccess()
    })
  } else {
    db.development.create(development)
      .then(createdCallback)
  }
}

function updateDevelopmentIfNeeded(development, existingDevelopment) {
  // check for updated status only (for now?)
  if (!isEqual(development.data.statuses, existingDevelopment.data.statuses)) {
    const newData = existingDevelopment.data
    newData.statuses = development.data.statuses
    existingDevelopment.update({
      data: newData
    }).then(() => {
      console.log(`updated status of ${development.data.name}`)
      numUpdated++
      numProcessed++
    })
  } else {
    numProcessed++
  }
}
