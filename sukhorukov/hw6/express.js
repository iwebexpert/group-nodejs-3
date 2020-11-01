const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override')

const taskModel = require('./models/task')
const userModel = require('./models/user')

const auth = require('./auth')

/**
 * Функция создания разметки опций для выбора приоритета задачи (с выбранным элементом)
 * Так как не удалось динамически отметить выбранный элемент в Handlebars понятным мне способом
 *
 * @param {number} taskPriority - приоритет 0 - 2
 * @return {array} - html
 */
const getOptionsTemplate = (taskPriority) => {
  let options = [
    `<option value="0">Низкий</option>`,
    `<option value="1">Нормальный</option>`,
    `<option value="2">Высокий</option>`,
  ]
  let option = options[taskPriority]
  options[taskPriority] = `${option.substr(0, 7)} selected${option.substr(7)}`

  return options.reverse() //для более правильного отображения выпадающего списка
}

const app = express()

//полключение к серверу баз данных
mongoose.connect('mongodb://localhost:27017/tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

//посредники разные
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static('public'))
app.use(methodOverride('_method'))

//посредник шаблонизатора Handlebars
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

//посредники авторизации
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
)
app.use(auth.initialize)
app.use(auth.session)
app.use('/tasks', auth.mustBeAuthenticated)

//отображение страницы приветствия
app.get('/', (req, res) => {
  // res.status(200).send('Hello, express.js!')
  res.redirect('/tasks')
})

//отображение формы для запроса данных на создание нового пользователя
app.get('/users/register', (req, res) => {
  const {error} = req.query
  const header = {
    title: 'Регистрация',
    link: [
      {
        href: '/users/auth',
        title: 'Авторизация',
      },
    ],
  }

  res.render('auth', { error, header, isRegForm: true })
})

//создание нового пользователя в базе данных
app.post('/users/register', async (req, res) => {
  const { repassword, ...restBody } = req.body

  if (restBody.password === repassword) {
    const user = new userModel(restBody)
    await user.save()
    res.redirect('/users/auth')
  } else {
    res.redirect('/users/register?error=Ощибка при заполнениии полей')
  }
})

//отображение формы для запроса данных на проверку существования пользователя в базе данных
app.get('/users/auth', (req, res) => {
  const { error } = req.query
  const header = {
    title: 'Авторизация',
    link: [
      {
        href: '/users/register',
        title: 'Регистрация',
      },
    ],
  }

  res.render('auth', { error, header })
})

//проверка существования пользователя на соответствие в базе данных
app.post('/users/auth', auth.authenticate)

//сброс результатов проверки существования пользователя в базе данных
app.get('/users/logout', (req, res) => {
  req.logout()

  res.redirect('/users/auth')
})

//отображение списка, имеющихся в базе данных, задач
app.get('/tasks', async (req, res) => {
  const tasks = await taskModel.find().lean()
  const header = {
    title: 'Список задач',
    link: [
      {
        href: '/task',
        title: 'Создать задачу',
      },
      {
        href: '/users/logout',
        title: 'Выход',
      },
    ],
  }

  res.render('tasks', { header, tasks })
})

//отображение формы для запроса данных на создания задачи
app.get('/task', async (req, res) => {
  const header = {
    title: 'Новая задача!',
    link: [
      {
        href: '/tasks',
        title: 'Список задач',
      },
    ],
  }

  res.render('task', { header, options: getOptionsTemplate(1) })
})

//создание новой задачи в базе данных
app.post('/task', async (req, res) => {
  let { body } = req
  if (body.completed) body.completed = true
  const task = new taskModel(body)
  await task.save()

  res.redirect('/tasks')
})

//отображение формы для запроса данных на изменение задачи
app.get('/task/:id', async (req, res) => {
  const { id } = req.params
  const task = await taskModel.findById(id).lean()
  const header = {
    title: `Редактирование задачи: "${task.title}"`,
    link: [
      {
        href: '/tasks',
        title: 'Список задач',
      },
    ],
  }

  res.render('task', {
    header,
    options: getOptionsTemplate(task.priority),
    task,
  })
})

//обновление старой задачи в базе данных
app.patch('/task/:id', async (req, res) => {
  const { id } = req.params
  let { body } = req
  if (body.completed) {
    body.completed = true
  } else {
    body.completed = false
  }
  await taskModel.findByIdAndUpdate(id, body).lean()

  res.redirect('/tasks')
})

//удаление задачи из базы данных
app.delete('/task/:id', async (req, res) => {
  const { id } = req.params
  await taskModel.findByIdAndDelete(id)

  res.redirect('/tasks')
})

//обработка необработаных запросов
app.get('*', (req, res) => {
  res.status(404).render('error')
})

//установка слушателя запросов
app.listen(4000, () => {
  console.log('http://localhost:4000')
})
