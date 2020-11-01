const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const exphbs = require('express-handlebars')
const taskRoutes = require('./routes/tasks')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const PORT = process.env.PORT || 3000

const userModel = require('./models/user')
const passport = require('./auth')

const app = express()
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.use('/', passport.mustBeAuthenticated)

app.use(taskRoutes)

async function start() {
  try {
    await mongoose.connect(
      'mongodb+srv://konstantin:1q2w3e4r@cluster0.dzss0.mongodb.net/<tasks>',
      {
        useNewUrlParser: true,
        useFindAndModify: false
      }
    )
    app.listen(PORT, () => {
      console.log('Server has been started...')
    })
  } catch (e) {
    console.log(e)
  }
}

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  const {repassword, ...restBody} = req.body

  if(restBody.password === repassword){
    const user = new userModel(restBody)
    await user.save()
    res.redirect('/auth')
  } else {
    res.redirect('/register?err=repassword')
  }
})

app.get('/auth', (req, res) => {
  const {error} = req.query
  res.render('auth', {error})
})

app.post('/auth', passport.authenticate)

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/auth')
})

start()
