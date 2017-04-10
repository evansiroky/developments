const epilogue = require('epilogue')

const auth = require('../auth')

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

function errorHandler (req, res, error) {
  console.error(error)
  res.status(500)
  res.json({message: 'Internal Error'})
  throw error
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

  function epilogueAuth (req, res, context) {
    auth.authRequired(req, res, (err) => {
      console.log(req.user)
      if (err) return context.error(err)
      context.continue()
    })
  }

  function epilogueAdminAuth(req, res, context) {
    auth.authRequired(req, res, (err) => {
      if (err) return context.error(err)
      auth.adminRequired(req, res, (err) => {
        if (err) return context.error(err)
        context.continue()
      })
    })
  }

  developmentResource.use(geomMiddleware)
  developmentResource.create.auth(epilogueAdminAuth)
  developmentResource.delete.auth(epilogueAdminAuth)
  developmentResource.update.auth(epilogueAdminAuth)
  developmentResource.create.error = errorHandler
  developmentResource.update.error = errorHandler
  developmentResource.delete.error = errorHandler
}
