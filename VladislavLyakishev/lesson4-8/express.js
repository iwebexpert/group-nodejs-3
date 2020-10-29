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
app.post('/', async (req, res) => {
    if(req.body.save && req.body.title){
        const task = new taskModel(req.body)
        const taskSaved = await task.save()
    }
    res.redirect('/')
})
app.delete('/:id', async (req, res) => {
    const {id} = req.params
    await taskModel.deleteOne({_id: id})
})



app.listen(3000)