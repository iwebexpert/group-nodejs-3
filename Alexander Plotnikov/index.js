const PORT = 8001
const db = require('./src/js/config')
const path = require('path')
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const Handlebars = require('handlebars')
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access')

const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('./src/js/auth')

const cookieParser = require('cookie-parser')

const rootRout = require('./src/js/routers/root')
const authRout = require('./src/js/routers/auth')
const tasksRout = require('./src/js/routers/work-with-tasks')

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'src')))

app.engine(
  '.hbs',
  exphbs({
    extname: '.hbs',
    defaultLayout: 'default',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
  })
)
app.set('view engine', '.hbs')

app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
)
app.use(passport.initialize)
app.use(passport.session)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(rootRout)
app.use(authRout)
app.use(tasksRout)

app.get('*', async (req, res) => {
  res.render('error')
})

async function start() {
  try {
    const link = `mongodb+srv://${db.login}:${db.password}@cluster0.n6oze.mongodb.net/${db.name}?retryWrites=true&w=majority`
    await mongoose.connect(link, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`))
  } catch (e) {
    console.error(e)
  }
}

start()
