const path = require('path')
const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const userController = require('./controllers/userController')
const newsController = require('./controllers/newsController')
const taskController = require('./controllers/taskController')
const passport = require('./auth')

const app = express()

mongoose.connect('mongodb://localhost:27016/tasks2', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

app.use(express.json())
app.use(
  express.urlencoded({
    extended: false,
  })
)
app.use(express.static('public'))
app.use(cookieParser())

app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultLayout: 'default',
    layoutsDir: path.resolve(__dirname, 'views', 'layouts'),
    partialsDir: path.resolve(__dirname, 'views', 'partials'),
  })
)

app.set('view engine', 'hbs')
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: '12asdasd12dsaklmrg32mok',
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
    }),
  })
)
app.use(passport.initialize)
app.use(passport.session)

app.get('/', (req, res) => {
  res.render('home')
})

app.use('/user', userController)
app.use('/news', newsController)
app.use('/tasks', taskController)

app.use((req, res) => {
  res.status(404).render('error')
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
