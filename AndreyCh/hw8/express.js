const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')
const http = require('http')
const socketIO = require('socket.io')
const hbs = require('express-handlebars')

const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

TOKEN_SECRET_KEY = 'fweoijfoewjfo23o4ij32orofi223'

mongoose.connect('mongodb://localhost:27017/tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const app = express()

const server = http.createServer(app)
const io = socketIO.listen(server)

io.use((socket, next) => {
  const token = socket.handshake.query.token

  jwt.verify(token, TOKEN_SECRET_KEY, (err) => {
    if(err){
        return next(new Error('Authorization error'))
    }
    next()
  })

  return next(new Error('Authorization error'))
})

io.on('connection', (socket) => {
  console.log('New connection')

  const emitTasks = async () => {
    const tasks = await taskModel.find().lean()
    socket.emit('tasks', tasks)
  }

  socket.on('tasks', async () => {
    await emitTasks();
  })

  socket.on('add', async (data) => {
    const task = new taskModel(data);
    await task.save();
    await emitTasks();
  })

  socket.on('delete', async (data) => {
    const {_id} = data;
    await taskModel.deleteOne({ _id: _id })
    await emitTasks();
  })

  socket.on('update', async (data) => {
    await taskModel.findOne({ _id: data._id }, function (err, doc){
      doc.title = data.title;
      doc.type = data.type;
      doc.isActive = data.isActive;
      doc.save();
    });
    await emitTasks();
  })
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
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

app.get('/', async (req, res) => {
  const tasks = await taskModel.find().lean()
  res.render('tasks', {tasks})
})

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
    res.render('auth')
})

app.get('/logout', (req, res) => {
    res.redirect('/login')
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
  res.status(404).render('error')
})

server.listen(4000, () => {
  console.log('http://127.0.0.1:4000')
})
