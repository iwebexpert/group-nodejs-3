const passport = require('passport')
const Strategy = require('passport-local').Strategy

const userModel = require('./model/user')

passport.use(
  new Strategy({ usernameField: 'login' }, async (login, password, done) => {
    let email = login
    let user = await userModel.findOne({ email })

    if (!user) {
      user = await userModel.findOne({ login })
    }

    if (!user) {
      return done(null, false)
    }

    if (!user.validatePassword(password)) {
      return done(null, false)
    }

    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password
    done(null, plainUser)
  })
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id)
  const plainUser = JSON.parse(JSON.stringify(user))
  delete plainUser.password
  done(null, plainUser)
})

module.exports = {
  passport:passport,
  initialize: passport.initialize(),
  session: passport.session(),
}
