const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')

const app = express()

const taskModel = require('./models/taskMysql')

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static('front/static'))

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: path.join(__dirname, '..', 'front', 'views', 'layouts'),
  partialsDir: path.join(__dirname, '..', 'front', 'views', 'partials'),
}))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '..', 'front', 'views'))

//TASK LIST
app.get('/', async (req, res) => {
  const tasks = await taskModel.getAll()
  res.render('tasks', {tasks})
})

//NEW TASK
app.get('/task', (req, res) => {
  res.render('taskForm')
})

//ADD OR UPDATE TASK
app.post('/tasks', async (req, res) => {
  const id = req.body.id
  const task = {
    name: req.body.name,
    user_id: +req.body.userId,
    status: +req.body.status,
  }
  await taskModel.save(task, id)
  res.redirect('/')
})

//GET TASK
app.get('/tasks/:id', async (req, res) => {
  const {id} = req.params
  const task = await taskModel.getOne({id: id})
  if(!task){
    res.status(404).render('error')
  }
  res.render('taskForm', {task})
})

//DELETE TASK
app.delete('/tasks/:id', async (req, res) => {
  const {id} = req.params
  await taskModel.delete({id: id})
  res.redirect('/')
})

//PAGE NOT FOUND
app.get('*', (req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})