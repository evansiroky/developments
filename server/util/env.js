const fs = require('fs')
const path = require('path')

const YAML = require('yamljs')

const envFolder = process.env.NODE_ENV === 'test' ? 'test' : 'default'
const configurationsFolder = path.resolve(`${__dirname}/../../configurations/${envFolder}`)
const envYml = `${configurationsFolder}/env.yml`
const settingsYml = `${configurationsFolder}/settings.yml`

// create env object with environment vars if in Heroku environment
let env = process.env
if (fs.existsSync(envYml)) {
  env = Object.assign(env, YAML.load(envYml))
}

let settings = {}
if (fs.existsSync(settingsYml)) {
  settings = YAML.load(settingsYml)
}

module.exports = {
  env,
  settings
}
