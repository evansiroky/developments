
module.exports = (app, db) => {
  require('./s3-sign')(app)
  require('./epilogue-routes')(app, db)
}
