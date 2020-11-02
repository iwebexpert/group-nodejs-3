const path = require('path')
const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

const userController = require('./controllers/usersController')
const newsController = require('./controllers/newsController')
const taskController = require('./controllers/taskController')

const app = express()

mongoose.connect('mongodb://localhost:27016/tasks', {
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

app.get('/', (req, res) => {
  res.render('home')
})

app.use('/users', userController)
app.use('/news', newsController)
app.use('/tasks', taskController)

app.use((req, res) => {
  res.status(404).render('error')
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
