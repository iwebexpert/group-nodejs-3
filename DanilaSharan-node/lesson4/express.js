const path = require('path')
const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')

const userController = require('./controllers/usersController')
const newsController = require('./controllers/newsController')

const app = express()

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

app.use((req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})
