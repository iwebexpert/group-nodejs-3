const passport = require('passport')
const { Strategy } = require('passport-local')

const UserModel = require('./mongo/models/user')

passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    const user = await UserModel.findOne({ email })

    if (!user) {
      return done(null, false)
    }

    if (!user.validatePassword(password)) {
      return done(null, false)
    }

    const plainUser = user.toObject()

    delete plainUser.password
    done(null, plainUser)
  })
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findById(id)

  const plainUser = user.toObject()
  delete plainUser.password
  done(null, plainUser)
})

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  authenticate: passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/user/auth?error=1',
  }),
  mustBeAuthenticated: (req, res, next) => {
    if (req.user) {
      next()
    } else {
      res.redirect('/user/auth')
    }
  },
}
