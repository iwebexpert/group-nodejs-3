const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('./config/mongodb')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const tasksModel = require('./models/tasks')
const userModel = require('./models/user')
const passport = require('./auth')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static('public'))

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    switch: function (value, options) {
      this.switch_value = value
      return options.fn(this)
    },
    case: function (value, options) {
      if (value === this.switch_value) {
        return options.fn(this)
      }
    },
    ifEquals: function (arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
    }
  }
}))
app.set('view engine', 'hbs')

app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: 'secretpass123123123',
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.all('/', (req, res) => {
  res.redirect('/tasks')
})

app.use(['/task', '/tasks'], passport.mustBeAuthenticated)

app.get('/tasks', async (req, res) => {
  const tasksList = await tasksModel.where('userId').equals(req.user._id).lean()
  res.render('tasksList', {tasksList})
})

app.get('/task', async (req, res) => {
  res.render('task')
})


app.get('/task/:id', async (req, res) => {
  const task = await tasksModel.findById(req.params.id).lean()
  if (task.userId === req.user._id)
    res.render('task', {task})
  else
    res.render('error')
})

app.post('/task', async (req, res) => {
  try {
    const task = new tasksModel(req.body)
    task.userId = req.user._id
    const taskSaved = await task.save()
    res.redirect('/tasks')
  } catch {
    res.redirect('/task')
  }
})

app.delete('/task/:id', async (req, res) => {
  const task = await tasksModel.findById(req.params.id)
  if (task.userId === req.user._id)
    await task.deleteOne({_id: req.params.id})
  else
    throw "Error deleting"
})

app.patch('/task/:id', async (req, res) => {
  const task = await tasksModel.findById(req.params.id)
  if (task.userId === req.user._id)
    await task.updateOne(req.body)
  else
    throw "Error updating"
})

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

app.get('*', (req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})