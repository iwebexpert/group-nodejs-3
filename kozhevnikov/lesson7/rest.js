const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')

const TOKEN_SECRET_KEY = 'jklhkljkghjkkl122eruoewryhisdgf'

const PORT = process.env.PORT || 3000

const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

const app = express()

async function start() {
    try {
        await mongoose.connect(
            'mongodb+srv://konstantin:1q2w3e4r@cluster0.dzss0.mongodb.net/<tasks>',
            {
                useNewUrlParser: true,
                useFindAndModify: false
            }
        )
        app.listen(PORT, () => {
            console.log('Server has been started http://localhost:3000...')
        })
    } catch (e) {
        console.log(e)
    }
}

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

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'jklhkljkghjkkl122eruoewryhisdgf',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.use('/tasks', mustBeAuthenticatedRestApi)

app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find().lean()
       res.status(200).json(tasks)

})

app.post('/tasks', async (req, res) => {
    const {title} = req.body
    if(title){
        const task = new taskModel({title})
        await task.save()
        res.status(201).json(task)
        return
    }
    res.status(400).json({message: 'Error'})
})

app.post('/tasks/complete', async (req, res) => {
    const {id} = req.body
    if(id){
        await taskModel.updateOne({_id: id}, {$set: {completed: true}})
    }
    res.status(204).send()
})

app.post('/tasks/remove', async (req, res) => {
    const {id} = req.body
    if(id){
        await taskModel.findByIdAndRemove(id)
    }
    res.status(204).send()
})

app.post('/tasks/update/:id', async (req, res) => {
    const {title} = req.body
    const {id} = req.params
    if(title){
        await taskModel.updateOne({_id: id}, {$set: {title}})
    }
    res.status(204).send()
})

app.get('/tasks/:id', async (req, res) => {
    const {id} = req.params
    const task = await taskModel.findById(id).lean()
    res.status(200).json(task)
})

app.post('/tasks', async (req, res) => {
    const task = new taskModel(req.body)
    const taskSaved = await task.save()
    res.status(201).json(taskSaved)
})

app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body

    if(restBody.password === repassword){
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

start()