const epilogue = require('epilogue')

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
}
