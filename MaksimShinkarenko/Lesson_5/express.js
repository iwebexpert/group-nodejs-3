const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')

const tasksModel = require('./models/tasks')

const app = express()

mongoose.connect('mongodb://localhost:27017/tasks', {
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
  helpers: {
    switch: function (value, options) {
      this.switch_value = value;
      return options.fn(this);
    },
    case: function (value, options) {
      if (value === this.switch_value) {
        return options.fn(this);
      }
    },
    ifEquals: function (arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    }
  }
}))
app.set('view engine', 'hbs')


app.get('/', async (req, res) => {
  const tasksList = await tasksModel.find().lean()
  res.render('tasksList', {tasksList})
})

app.get('/task', async (req, res) => {
  res.render('task')
})


app.get('/task/:id', async (req, res) => {
  const task = await tasksModel.findById(req.params.id).lean()
  res.render('task', {task})
})

app.post('/task', async (req, res) => {
  const task = new tasksModel(req.body)
  const taskSaved = await task.save()
  res.redirect('/')
})

app.delete('/task/:id', async (req, res) => {
  const task = await tasksModel.findById(req.params.id)
  await task.deleteOne({_id: req.params.id})
})

app.patch('/task/:id', async (req, res) => {
  const task = await tasksModel.findById(req.params.id)
  await task.updateOne(req.body)
})


app.get('*', (req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})