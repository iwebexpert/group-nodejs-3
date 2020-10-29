const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')

const users = require('./data/users')
const taskModel = require('./models/task')

const app = express()

mongoose.connect('mongodb://localhost:27016/tasks', {
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


app.get('/', (req, res) => {
    res.status(200).send('Hello, express.js!')
})



app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find()
    res.json(tasks)
})

app.post('/tasks', async (req, res) => {
    const task = new taskModel(req.body)
    const taskSaved = await task.save()
    res.json(taskSaved)
    //Добавить связку с handlebars
})

app.delete('/task/:id', async (req, res) => {
  const task = await taskModel.findById(req.params.id)
  await task.deleteOne({_id: req.params.id})
})

app.patch('/task/:id', async (req, res) => {
  const task = await taskModel.findById(req.params.id)
  await task.updateOne(req.body)
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

app.get('*', (req, res) => {
    res.status(404).render('error')
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})
