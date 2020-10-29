const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')

const taskModel = require('./models/task')

/**
 * Функция создание разметки опций для выбора приоритета задачи (с выбранным элементом)
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

	return options.reverse() // для более правильного отображения выпадающего списка
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

// вывод списка, имеющихся в базе данных, задач
app.get('/', async (req, res) => {
  const tasks = await taskModel.find().lean()
  const header = {
    title: 'Список задач',
    isCreateLink: true
  }

  res.render('tasks', {header, tasks})
})

// отобрадение формы для для запроса данных на создания задачи
app.get('/create', async (req, res) => {
  const options = getOptionsTemplate(1)
  const header = {title: 'Новая задача!'}

  res.render('task', {header, options, create: true})
})

// создание новой задачи в базе данных
app.post('/', async (req, res) => {
  let { body } = req
  if (body.completed) body.completed = true
  const task = new taskModel(body)
  console.log(`task: `, task, body)
  const saved = await task.save()

  if (saved) res.redirect('/')
})

// отобрадение формы для запроса данных на изменение задачи (используется view.hbs создания задачи)
app.get('/update/:id', async (req, res) => {
  const { id } = req.params
	const task = await taskModel.findById(id).lean()
  const options = getOptionsTemplate(task.priority)
  const header = {title: `Редактирование задачи: "${task.title}"`}
		
  res.render('task', {header, options, task})
})

// обновление старой задачи в базе данных
// обновляются все поля сущности - поэтому, подумал, что не patch
app.put('/:id', async (req, res) => {
	const { id } = req.params
	let { body } = req
  if (body.completed) {
		body.completed = true
	} else {
		body.completed = false
	}
  const updated = await taskModel.findByIdAndUpdate(id, body).lean()
  
  if (updated) res.redirect('/')
})

// удаление задачи из базы данных
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
