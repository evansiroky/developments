// copied and modified from https://github.com/sequelize/express-example

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const env = require('../util/env').env

const sequelize = new Sequelize(env.DATABASE_URL, {logging: false})
const db = {}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
