const epilogue = require('epilogue')

function addCrsToGeom (req, res, context) {
  if (req.body.geom) {
    req.body.geom.crs = { type: 'name', properties: { name: 'EPSG:4326'} }
  }
  return context.continue
}

const geomMiddleware = {
  create: {
    start: addCrsToGeom
  },
  update: {
    start: addCrsToGeom
  }
}

module.exports = (app, db) => {
  epilogue.initialize({
    app: app,
    base: '/api',
    sequelize: db.sequelize
  })

  const developmentResource = epilogue.resource({
    model: db.development,
    endpoints: ['/developments', '/development/:id']
  })

  developmentResource.use(geomMiddleware)
}
