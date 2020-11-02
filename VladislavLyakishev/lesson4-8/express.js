const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const cookieParser = require('cookie-parser')
const google = require('translate-google')
//MyModul
const selectCount = require('./db/selectCount')
const selectLang = require('./db/selectLang')
const newsArr = require('./module/parser')
//Config
const mongoose = require('./config/mongodb')
//Model
const taskModel = require('./Model/Task')
const userModel = require('./Model/User')
//Auth
const passport = require('./auth')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)



const app = express()


//Middleware
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.json())

// Engine Express Handlebars
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'default',
    layoutsDir: path.join( __dirname, 'views', 'layouts'),
    partialsDir: path.join( __dirname, 'views', 'partials'),
    allowedProtoMethods: false
}))
// App Set
app.set('view engine', 'hbs')

//Session
app.use(session(
    {
        resave: true,
        saveUninitialized: false,
        secret: '1234asvgadafara4wqeqedasf314eefdasf2',
        store: new MongoStore({mongooseConnection: mongoose.connection})
    }
))

//Serialize

app.use(passport.initialize)
app.use(passport.session)

app.use('/news', passport.mustBeAuthenticated)

// NEWS
app.get('/news', (req, res) => {
    const params = req.cookies.params ? req.cookies.params : {count: 5000000, lang: 'ru'}
    const date = (new Date).toLocaleDateString()
    let newsCount = []
    newsArr.forEach( (elem, i) => {
        if (i < params.count) {
            newsCount.push(elem)
        }
    })
    if (params.lang !== 'ru'){
        google(newsCount, {from: 'ru', to: params.lang}).then(newsCount => {
            customRender(newsCount)
        }).catch(err => {
            console.error(err)
        })
    } else {
        customRender(newsCount)
    }
    function customRender (newsCount) {
        res.render(
            'index', 
            {
                date, 
                selectCount, 
                selectLang, 
                newsCount,
                helpers: {
                    selectedCount: function (v1){
                        if (v1 === +params.count) {
                            return 'selected'
                        }
                    },
                    selectedLang: function (v1) {
                        if (v1 === params.lang){
                            return 'selected'
                        }
                    }
                }
            })
    }
    
})

app.post('/news', (req, res) => {
    const params = req.body
    if (params.save === 'Сохранить'){
        res.cookie('params', params)
        res.redirect('/')
    }
})

//Tasks

app.get('/', async (req, res) => {
    const tasks = await taskModel.find().sort('-created').lean()
    res.render('tasks', {tasks})
})
app.get('/task/:id', async (req, res) => {
    const {id} = req.params
    const tasks = await taskModel.find().sort('-created').lean()
    const task = await taskModel.findById(id)
    const value = task.title
    res.render('tasks', {tasks, value, id})
})
app.post('/', async (req, res) => {
    if(req.body.save === 'Добавить' && req.body.title){
        const task = new taskModel(req.body)
        const taskSaved = await task.save()
    }
    res.redirect('/')
})
app.post('/task/:id', async (req, res) => {
    const {id} = req.params
    if(req.body.save === 'Редактировать' && req.body.title){
        const task = await taskModel.findOne({_id: id})
        task.title = req.body.title
        const taskSaved = await task.save()
    }
    res.redirect('/')
})
app.delete('/:id', async (req, res) => {
    const {id} = req.params
    await taskModel.deleteOne({_id: id})
    res.sendStatus(200)
})
app.patch('/:id', async (req, res) => {
    const {id} = req.params
    const task = await taskModel.findOne({_id: id})
    task.complited = !task.complited
    const taskSaved = await task.save()
    res.sendStatus(200)
})

// Register

app.get('/reg', (req, res) => {
    const {error} = req.query
    res.render('register', {error})
})

app.post('/reg', async (req, res) => {
    const {rePassword, ...restBody} = req.body
    if(restBody.password === rePassword){
        const user = new userModel(restBody)
        await user.save()
        res.redirect('/auth')
    } else {
        res.redirect('/reg?error=1')
    }
})


// Auth

app.get('/auth', (req, res) => {
    const {error} = req.query
    res.render('auth', {error})
})

app.post('/auth', passport.authenticate )

// Logout

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})




app.get('*', (req, res) => {
    res.redirect('/')
})



app.listen(3000)