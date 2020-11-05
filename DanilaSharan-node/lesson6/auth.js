const passport = require('passport')
const Strategy = require('passport-local').Strategy
// const FacebookStrategy = require('passport-facebook').Strategy
// const { FACEBOOK_KEY, FACEBOOK_SECRET } = require('./data/.env')


const userModel = require('./models/user')

passport.use(
    new Strategy({usernameField: 'email'}, async (email, password, done) => {
        const user = await userModel.findOne({email})

        if(!user){
            return done(null, false)
        }

        if(!user.validatePassword(password)){
            return done(null, false)
        }

        const plainUser = JSON.parse(JSON.stringify(user))
        delete plainUser.password
        done(null, plainUser)
    })
)
// TODO не взлетело, не могу понять почему
// passport.use(new FacebookStrategy({
//     clientID: "537223300557180",
//     clientSecret: 'a0cb629e97993fd844fd507c4ac18093',
//     callbackURL: "http://localhost:4000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     userModel.findOrCreate(function(err, user) {
//       if (err) { return done(err); }
//       done(null, user);
//     });
//   }
// ));


passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id)
    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password
    done(null, plainUser) //req.user
})

module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    authenticate: passport.authenticate('local', {
        successRedirect: '/tasks',
        failureRedirect: '/auth?error=1',
    }),
    mustBeAuthenticated: (req, res, next) => {
        if(req.user){
            next()
        } else {
            res.redirect('/auth')
        }
    }
}
