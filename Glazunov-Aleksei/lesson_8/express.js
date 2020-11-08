const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

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

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
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
    secret: 'evjvrejnevrnoeioirjnnernerunru',
    store: new MongoStore ({mongooseConnection: mongoose.connection})
}))

app.use(passport.initialize)
app.use(passport.session)

app.use('/tasks', passport.mustBeAuthenticated)

app.get('/', (req, res) => {
    res.status(200).send('Hello, express.js!')
})

// app.get('/tasks', async (req, res) => {
//     const tasks = await taskModel.getAll()
//     res.json(tasks)
// })

// app.post('/tasks', async (req, res) => {
//     const taskSaved = await taskModel.add(req.body)
//     res.json(taskSaved)
// })

app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find({user: req.user._id})
    res.render('tasks', {tasks: JSON.parse(JSON.stringify(tasks)), user: req.user})
    //res.json(tasks)
})

app.post('/tasks', async (req, res) => {
    const newTask = JSON.parse(JSON.stringify(req.body))
    newTask.user = req.user._id
    const task = new taskModel(newTask)
    const taskSaved = await task.save()
    res.json(taskSaved)
    //Добавить связку с handlebars
})

//TODO - CRUD
app.delete('/tasks', async (req, res) => {
    const {id} = req.body
    const tasks = await taskModel.findByIdAndDelete(id)
    res.json(tasks)
})
app.patch('/tasks', async (req, res) => {
    const {id} = req.body
    const tasks = await taskModel.findByIdAndUpdate(id, req.body)
    res.json(tasks)
})

app.get('/users', (req, res) => {
    if(req.test){
        console.log(req.test)
    } else {
        console.log('Заголовок test не был передан')
    }
    // res.status(200).send('Users!')
    res.render('users', {users})
})

app.post('/users', (req, res) => {
   console.log(req.body)
    res.status(200).send('Post!')
})

app.get('/users/:username', (req, res) => {
    const {username} = req.params

    const user = users[username]

    if(!user){
        res.status(404).render('error')
    }

    res.render('user', {user})
})

app.get('/config', (req, res) => {
    res.render('config')
 })

 app.post('/config', (req, res) => {
     console.log(req.body)
     const {param1} = req.body
     console.log(+param1)
    res.redirect('/config')
 })

 app.get('/cookie/get', (req, res) => {
     console.log(req.cookies)
     res.send(JSON.stringify(req.cookies))
 })

 app.get('/cookie/set', (req, res) => {
    res.cookie('count', Math.floor(Math.random() * 10))
    res.redirect('/cookie/get')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body

    if (restBody.password === repassword) {
        const user = new userModel(restBody)
            await user.save()
            res.redirect('/auth')
    } else {
        res.redirect('/register?error=repassword')
    }
})

app.get('/auth', (req, res) => {
    const {error} = req.query
    res.render('auth', {error})
})

app.post('/auth', passport.authenticate)

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})

//Вариант 1
// app.use((req, res) => {
//     res.status(404).render('error')
// })

//Вариант 2
app.get('*', (req, res) => {
    res.status(404).render('error')
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})