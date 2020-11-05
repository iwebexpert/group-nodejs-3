const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')

const TOKEN_SECRET_KEY = 'vdsguygewyuvergug43436sguwryt63wt364ygduy'

const users = require('./data/users')
// const taskModel = require('./models/taskMysql')
const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')
const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants')

const app = express()

mongoose.connect('mongodb://localhost:27017/tasks2', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
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

app.listen(4000, () => {
    console.log('http://localhost:4000')
})