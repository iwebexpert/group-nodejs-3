const express = require('express')

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const mongoose = require('mongoose')
const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

const cors = require('cors')
const jwt = require('jsonwebtoken')

const TOKEN_SECRET_KEY = 'efiuweihfwefiewhfiuwehfiuewhf234234fiewufhi'

mongoose.connect('mongodb://localhost:27017/tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const mustBeAuthenticatedRestApi = (req, res, next) => {
  if(req.headers.authorization){
    const [type, token] = req.headers.authorization.split(' ')

    jwt.verify(token, TOKEN_SECRET_KEY, (err, decoded) => {
      if(err){
          return res.status(403).send()
      }

      req.user = decoded
      next()
    })
  } else {
    res.status(403).send()
  }
}

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.use('/tasks', mustBeAuthenticatedRestApi)

app.get('/tasks', async (req, res) => {
  const tasks = await taskModel.find().lean()
  res.status(200).json(tasks)
})

app.post('/task', async (req, res) => {
  try {
    const body = JSON.parse(JSON.stringify(req.body))
    if (body.hasOwnProperty('_id')) {
      delete body._id
    }
    const task = new taskModel(body)
    await task.save()
    res.status(201).json(task)
  } catch (e) {
    res.status(400).json({error: e.toString()})
  }
})

app.patch('/task/:_id', async (req, res) => {
  try {
    const body = JSON.parse(JSON.stringify(req.body))
    await taskModel.findOne({ _id: body._id }, function (err, doc){
      doc.title = body.title;
      doc.type = body.type;
      doc.isActive = body.isActive;
      doc.save();
    });
    res.status(200).send()
  } catch (e) {
    res.status(400).json({error: e.toString()})
  }
})

app.delete('/task/:_id', async (req, res) => {
  const {_id} = req.params
  await taskModel.remove({ _id: _id })
  res.status(200).send()
})

app.post('/register', async (req, res) => {
  try {
    const user = new userModel(req.body)
    await user.save()
    res.status(200).send()
  } catch (e) {
    res.status(400).json({error: e.toString()})
  }
})

app.post('/auth', async (req, res) => {
  const {email, password} = req.body
  const user = await userModel.findOne({email})

    if(!user){
        return res.status(401).send()
    }

    if(!user.validatePassword(password)){
        return res.status(401).send()
    }

    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password

    res.status(200).json({
        ...plainUser,
        token: jwt.sign(plainUser, TOKEN_SECRET_KEY)
    })
})

app.use((req, res) => {
    res.status(404).send()
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})
