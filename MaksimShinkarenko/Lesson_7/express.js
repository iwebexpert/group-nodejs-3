const express = require('express')
const path = require('path')
const mongoose = require('./config/mongodb')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')

const TOKEN_SECRET_KEY = 'asdfag5w54ydh34ga423'

const TasksModel = require('./models/tasks')
const UserModel = require('./models/user')
const passport = require('./auth')

const app = express()

const mustBeAuthenticatedRestApi = (req, res, next) => {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(' ')

    jwt.verify(token, TOKEN_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send()
      }

      req.user = decoded
      next()
    })
  } else {
    res.status(403).send()
  }
}

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

/*app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: 'secretpass123123123',
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)*/

app.get('/', (req, res) => {
  res.status(204).send()
})

app.use(['/task', '/tasks'], mustBeAuthenticatedRestApi)

app.get('/tasks', async (req, res) => {
  const tasksList = await TasksModel.where('user').equals(req.user._id).lean()
  return res.status(200).json(tasksList)
})

app.get('/task/:id', async (req, res) => {
  const task = await TasksModel.findById(req.params.id).lean()
  if (task.user === req.user._id)
    return res.status(200).json(task)
  else
    return res.status(403).send()
})

app.post('/task', async (req, res) => {
  try {
    const task = new TasksModel(req.body)
    task.user = req.user._id
    const taskSaved = await task.save()
    return res.status(201).send()
  } catch {
    return res.status(400).json({error: 'Error'})
  }
})

app.delete('/task/:id', async (req, res) => {
  const task = await TasksModel.findById(req.params.id)
  if (task.user === req.user._id){
    await task.deleteOne({_id: req.params.id})
    return res.status(204).send()
  }
  else
    return res.status(403).send()
})

app.put('/task/:id', async (req, res) => {
  const task = await TasksModel.findById(req.params.id)
  if (task.user=== req.user._id) {
    await task.updateOne(req.body)
    return res.status(201).send()
  }
  else
    return res.status(403).send()
})

app.post('/register', async (req, res) => {
  const {repassword, ...restBody} = req.body

  if(restBody.password === repassword){
    const user = new UserModel(restBody)
    await user.save()
    res.status(204).send()
  } else {
    res.status(400).json({error: "Error"})
  }
})

app.post('/auth', async (req, res) => {
  const {email, password} = req.body
  const user = await UserModel.findOne({email})

  if (!user) {
    return res.status(401).send()
  }

  if (!user.validatePassword(password)) {
    return res.status(401).send()
  }

  const plainUser = JSON.parse(JSON.stringify(user))
  delete plainUser.password

  res.status(200).json({
    ...plainUser,
    token: jwt.sign(plainUser, TOKEN_SECRET_KEY)
  })
})

app.get('*', (req, res) => {
  res.status(404).send()
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})