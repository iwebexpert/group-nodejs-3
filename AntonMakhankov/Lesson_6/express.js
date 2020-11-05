const express       = require('express')
const hbs           = require('express-handlebars')
const cookieParser  = require('cookie-parser')
const path          = require('path')
const mongoose      = require('mongoose')
const session       = require('express-session')
const MongoStore    = require('connect-mongo')(session)
const taskModel     = require('./models/task')
const userModel     = require('./models/user')
const passport      = require('./auth')


const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/tasks', {
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
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.use('/tasks', passport.mustBeAuthenticated)

app.get('/', (req, res) => {
    res.redirect('/tasks')
})

app.get('/tasks', async (req, res) => {
    const user = req.user
    const tasks = await taskModel.find({"user": user}).lean()
    res.render('tasks', {tasks})
})

app.post('/tasks', async (req, res) => {
    const title = req.body.title
    const user = req.user
    if(title){
        const task = new taskModel({"title":title,"user":user})
        await task.save()
    }
    res.redirect('/tasks')
})

app.post('/tasks/complete', async (req, res) => {
    const {id} = req.body
    if(id){
        await taskModel.updateOne({_id: id}, {$set: {completed: true}})
    }
    res.redirect('/tasks')
})

app.post('/tasks/remove', async (req, res) => {
    const {id} = req.body
    if(id){
        await taskModel.findByIdAndRemove(id)
    }
    res.redirect('/tasks')
})

app.post('/tasks/update/:id', async (req, res) => {
    const {title} = req.body
    const {id} = req.params
    if(title){
        await taskModel.updateOne({_id: id}, {$set: {title}})
    }
    res.redirect('/tasks')
})

app.post('/tasks', async (req, res) => {
    const task = new taskModel(req.body)
    const taskSaved = await task.save()
    res.redirect('/tasks')
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
    const {error} = req.query
    res.render('auth', {error})
})

app.post('/auth', passport.authenticate)

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})

app.get('*', (req, res) => {
    res.status(404).render('error')
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})