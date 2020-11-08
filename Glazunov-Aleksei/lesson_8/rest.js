const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')
const http = require('http')
const socketIO = require('socket.io')

mongoose.connect('mongodb://localhost:27017/tasks2', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const TOKEN_SECRET_KEY = 'vdsguygewyuvergug43436sguwryt63wt364ygduy'

const users = require('./data/users')
// const taskModel = require('./models/taskMysql')
const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')
const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants')

const app = express()

const server = http.Server(app)
const io = socketIO(server)

io.use((socket, next) => {
    const token = socket.handshake.query.token

    jwt.verify(token, TOKEN_SECRET_KEY, err =>{
        if (err) {
            return next(new Error('Authorization error'))
        }

        next()
    })

    return next(new Error('Authorization error'))
})

io.on('connection', (socket)=>{
    console.log('New connection')

    // Обмен событиями

    socket.on('create', async (data)=>{
        console.log('Event from client - create')
        const {title} = data
        if (title) {
            const task = new taskModel(data)
            const taskSaved = await task.save()

            socket.broadcast.emit('created', taskSaved) // Для всех остальных кроме пользователя
            socket.emit('created', taskSaved) // Для пользователя, который отправил события create
        }
    })
    
    socket.on('toggle', async (taskID)=>{
        console.log('Event from client - toggle', taskID)
        
        const task = await taskModel.findById(taskID);
        if (task) {
            await taskModel.findByIdAndUpdate(taskID, {completed: !task.completed})
            
            socket.broadcast.emit('toggled', taskID) // Для всех остальных кроме пользователя
            socket.emit('toggled', taskID) // Для пользователя, который отправил события create
        }
    })

    socket.on('edit', async (data)=>{
        console.log('Event from client - edit')
        await taskModel.findByIdAndUpdate(data.id, {title: data.title})
        
        socket.broadcast.emit('edited', data) // Для всех остальных кроме пользователя
        socket.emit('edited', data) // Для пользователя, который отправил события create
        
    })
    
    socket.on('delete', async(taskID)=> {
        console.log('Event from client - delete', taskID)
        
        await taskModel.findByIdAndDelete(taskID)
        socket.broadcast.emit('deleted', taskID) // Для всех остальных кроме пользователя
        socket.emit('deleted', taskID)
    })

    socket.on('disconnect', ()=> {
        console.log('New disconnect')
    })
})

const mustBeAuthenticatedRestApi = (req, res, next) => {
    if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ')

        jwt.verify(token, TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                res.status(403).send()
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

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'evjvrejnevrnoeioirjnnernerunru',
    store: new MongoStore ({mongooseConnection: mongoose.connection})
}))

app.use(passport.initialize)
app.use(passport.session)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'))
})

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'auth.html'))
})

app.use('/tasks', mustBeAuthenticatedRestApi)

app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find({user: req.user._id})
    res.status(200).json(tasks)
})

app.post('/tasks', async (req, res) => {
    const newTask = JSON.parse(JSON.stringify(req.body))
    if (newTask) {
        newTask.user = req.user._id
        const task = new taskModel(newTask)
        const taskSaved = await task.save()
        res.status(201).json(taskSaved)
        return
    } else {
        res.status(400).json({message: 'Error'})
    }
})

app.delete('/tasks', async (req, res) => {
    const {id} = req.body
    await taskModel.findByIdAndDelete(id)
    res.status(204).send()
})
app.patch('/tasks', async (req, res) => {
    const {id} = req.body
    await taskModel.findByIdAndUpdate(id, req.body)
    res.status(204).send()
})

app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body

    if (restBody.password === repassword) {
        const user = new userModel(restBody)
            await user.save()
            res.status(204).send()
    } else {
        res.status(400).json({message: 'Auth error'})
    }
})

app.post('/auth', async (req, res) => {
    const {email, password} = req.body
    const user = await userModel.findOne({email})

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

// app.get('/logout', (req, res) => {
//     req.logout()
//     res.redirect('/auth')
// })

app.get('*', (req, res) => {
    res.status(404).json({message: 'Error'})
})

server.listen(4000, () => {
    console.log('http://localhost:4000')
})