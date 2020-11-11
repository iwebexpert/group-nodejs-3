const express = require('express')
const path = require('path')
const mongoose = require('./config/mongodb')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')
const http = require('http')
const socketIO = require('socket.io')

const TOKEN_SECRET_KEY = 'asdfag5w54ydh34ga423'

const TasksModel = require('./models/tasks')
const UserModel = require('./models/user')
const passport = require('./auth')

const app = express()

const server = http.Server(app)
const io = socketIO(server)


io.use((socket, next) => {
  const token = socket.handshake.query.token

  jwt.verify(token, TOKEN_SECRET_KEY, (err) => {
    if (err) {
      return next(new Error('Ошбика авторизации'))
    }
    next()
  })

  return next(new Error('Ошибка авторизации'))
})

io.on('connection', (socket) => {
  console.log('Новое соединение')

  socket.on('create', async (data) => {
    console.log('Event from client - create')
    const {title} = data
    if(title) {
      const task = new TasksModel({title})
      const savedTask = await task.save()

      socket.broadcast.emit('created', savedTask)
      socket.emit('created', savedTask)
    }
  })

  socket.on('toggle', async (taskId) => {
    console.log('Event from client - toggle')

    const task = await TasksModel.findById(taskId)
    if(task){
      await TasksModel.updateOne({_id: taskId}, {$set: {completed: !task.completed}})
      socket.broadcast.emit('toggled', taskId)
      socket.emit('toggled', taskId)
    }
  })

  socket.on('delete', async (taskId) => {
    console.log('Event from client - delete')
    if(taskId){
      await TasksModel.findByIdAndRemove(taskId)
    }
    socket.broadcast.emit('deleted', taskId)
    socket.emit('deleted', taskId)
  })

  socket.on('disconnect', () => {
    console.log('Разрыв соединения')
  })
})


const mustBeAuthenticated = (req, res, next) => {
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

app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: 'sfgareghwehgw453qg3sdfasdf',
  store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'auth.html'))
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'register.html'))
})

app.use('/tasks', mustBeAuthenticated)

app.get('/tasks', async (req, res) => {
  const tasks = await TasksModel.find().lean()
  res.status(200).json(tasks)
})

app.post('/register', async (req, res) => {
  const {repassword, ...restBody} = req.body
  const user = await UserModel.findOne({email: restBody.email})
  if (user) {
    return res.status(400).json({message: 'Email уже зарегистрирован'})
  }

  if(restBody.password === repassword){
    const user = new UserModel(restBody)
    await user.save()
    res.status(204).send()
  } else {
    res.status(400).json({message: 'Auth error'})
  }
})

app.post('/auth', async (req, res) => {
  const {email, password} = req.body
  const user = await UserModel.findOne({email})

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

app.get('*', (req, res) => {
  res.status(404).send()
})

server.listen(4000, () => {
  console.log('http://localhost:4000')
})