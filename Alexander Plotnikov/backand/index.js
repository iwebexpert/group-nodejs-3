const PORT = 8001
const TOKEN_SECRET_KEY = require('./src/js/secret')
const db = require('./src/js/config')
const path = require('path')
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cors = require('cors')
const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
const multer = require('multer')
const upload = multer()

const history = require('connect-history-api-fallback');

app.use(history())

const mustBeAuthorizationRestApi = (req, res, next) => {
  if (req.params.token) {
    jwt.verify(req.params.token, TOKEN_SECRET_KEY, (err, data) => {
      if (err) return next()
      delete data.password1
      req.user = data
      next()
    })
  } else {
    next()
  }
}

const authRout = require('./src/js/routers/auth')
const tasksRout = require('./src/js/routers/work-with-tasks')

app.use(express.static(path.join(__dirname, 'src')))
app.use(express.static(path.join(__dirname, 'src/dist')))

app.use(cors())

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(upload.array())

app.use('*/:token', mustBeAuthorizationRestApi)

app.use(authRout)
app.use(tasksRout)

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname,'src/dist/index.html'))
})

app.get('*', async (req, res) => {
  res.status(404).send()
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
