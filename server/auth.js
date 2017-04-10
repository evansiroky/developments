const jwt = require('express-jwt')

let authRequired
if (process.env.AUTH0_SECRET && process.env.NODE_ENV !== 'test') {
  authRequired = jwt({secret: process.env.AUTH0_SECRET})
} else {
  authRequired = (req, res, next) => {
    req.user = {
      sub: 'test-user'
    }
    next()
  }
}

function adminRequired (req, res, next) {
  if (!req.user || !req.user.user_metadata || !req.user.user_metadata.isAdmin) {
    res.status(403)
    res.json({error: 'admin user required'})
    return
  }
  next()
}

module.exports = {
  authRequired: authRequired,
  adminRequired: adminRequired
}
