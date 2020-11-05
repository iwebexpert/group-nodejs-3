const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const mongoose = require('mongoose')
const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

const TASK_TYPES_CLASSES = {
  1: 'alert-primary',
  2: 'alert-success',
  3: 'alert-warning'
}
const TASK_TYPES_NAMES = {
  1: 'Home',
  2: 'Work',
  3: 'Study'
}
const TASK_TYPE_CLASS_NOT_ACTIVE = 'alert-light'

mongoose.connect('mongodb://localhost:27017/tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static('public'))

const taskColorHelper = (type, isActive) => {
  if (!isActive) {
    return TASK_TYPE_CLASS_NOT_ACTIVE;
  }
  return TASK_TYPES_CLASSES[type]
}

const taskTypeNameHelper = (type, isActive) => {
  return `${TASK_TYPES_NAMES[type]}${isActive ? '' : ' [NOT ACTIVE TASK]'}`
}

const jsonStringifyHelper = (task) => {
  return JSON.stringify(task)
}

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    'task-type-name': taskTypeNameHelper,
    'task-color': taskColorHelper,
    'stringify': jsonStringifyHelper,
  },
}))
app.set('view engine', 'hbs')

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.all('/', passport.mustBeAuthenticated)

app.get('/', async (req, res) => {
  const tasks = await taskModel.find().lean()
  res.render('tasks', {tasks})
})

const addTask = async (body) => {
  if (body.hasOwnProperty('_id')) {
    delete body._id
  }
  const task = new taskModel(body)
  await task.save()
}

const updateTask = async (body) => {
  await taskModel.findOne({ _id: body._id }, function (err, doc){
    doc.title = body.title;
    doc.type = body.type;
    doc.isActive = body.isActive;
    doc.save();
  });
}

app.post('/task', async (req, res) => {
    const body = JSON.parse(JSON.stringify(req.body))
    if (body.isActive && body.isActive.toLowerCase() === 'on') {
      body.isActive = true
    }

    if (!body._id) {
      await addTask(body)
    } else {
      await updateTask(body)
    }
    res.redirect('/')
})

app.post('/task/:_id', async (req, res) => {
  const {_id} = req.params
  await taskModel.remove({ _id: _id })
  res.redirect('/')
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

app.use((req, res) => {
    res.status(404).render('error')
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})
