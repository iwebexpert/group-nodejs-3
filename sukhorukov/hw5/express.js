const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')

const taskModel = require('./models/task')


/**
 * Функция создание разметки опций выбора приоритета задачи с выбранным элементом
 * Не удалось динамически отметить выбранный элемент в Handlebars понятным мне способом
 * 
 * @param {number} taskPriority - приоритет 0 - 2
 * @return {array} - html
 */
const getOptionsTemplate = taskPriority => {
	let options = [
		`<option value="0">Низкий</option>`,
		`<option value="1">Нормальный</option>`,
		`<option value="2">Высокий</option>`
	]
	let option = options[taskPriority]
	options[taskPriority] = `${option.substr(0, 7)} selected${option.substr(7)}`

	return options
} 

const app = express()

mongoose.connect('mongodb://localhost:27017/tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultLayout: 'default',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
	})
)

app.set('view engine', 'hbs')

app.get('/', async (req, res) => {
  const tasks = await taskModel.find().lean()
  res.render('tasks', { header: 'Список задач', tasks })
})

app.get('/create', async (req, res) => {
	const options = getOptionsTemplate(1)
  res.render('task', { header: `Новая задача!`, options, create: true})
})

app.post('/', async (req, res) => {
  let { body } = req
  if (body.completed) body.completed = true
  const task = new taskModel(body)
  console.log(`task: `, task, body)
  const saved = await task.save()

  if (saved) res.redirect('/')
})

app.get('/update/:id', async (req, res) => {
  const { id } = req.params
	const task = await taskModel.findById(id).lean()
	const options = getOptionsTemplate(task.priority)
		
  res.render('task', { header: `Редактирование задачи: "${task.title}"`, options, task })
})

// обновляются все поля сущности - поэтому не patch
app.put('/:id', async (req, res) => {
	const { id } = req.params
	let { body } = req
  if (body.completed) body.completed = true
	const updated = await taskModel.findByIdAndUpdate(id, body).lean()
	console.log(`updated: `, updated)
  if (updated) res.redirect('/')
})

app.delete('/:id', async (req, res) => {
  const { id } = req.params
  const deleted = await taskModel.findByIdAndDelete(id)
  if (deleted) res.redirect('/')
})

app.get('*', (req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})
