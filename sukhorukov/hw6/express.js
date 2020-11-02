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
const getPrioritySelectorData = require('./helpers')

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
        title: 'У меня уже есть учетная запись',
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
    res.redirect('/users/register?error=Пароли не совпадают или такая учетная запись уже существует')
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
        title: 'У меня ещё нет учётной записи',
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

//отображение списка, имеющихся в базе данных, задач текущего пользователя
app.get('/tasks', async (req, res) => {
  const tasks = await taskModel.find({userId: req.user._id}).lean()
  const header = {
    title: `Список задач пользователя "${req.user.firstName ==='' ? 'Безымянный' : req.user.firstName}"`,
    link: [
      {
        href: '/task',
        title: 'Создать задачу',
      },
      {
        href: '/users/logout',
        title: `Выход`,
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

  const priorityData = getPrioritySelectorData()
  res.render('task', {header, priorityData})
})

//создание новой задачи в базе данных
app.post('/task', async (req, res) => {
  let { body } = req
  if (body.completed) body.completed = true
  const task = new taskModel(body)
  const {priority} = body

  const priorityData = getPrioritySelectorData()
  task.priority.code = priority
  task.priority.title = priorityData.find(item => item.code == priority).title
  task.userId = req.user._id
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
        title: `Список задач`,
      },
    ],
  }

  const priorityData = getPrioritySelectorData(task.priority.code)
  res.render('task', { header, priorityData, task})
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

  //засовывание значения пришедшего из селектора в поле объекта priority модели task
  const {priority} = body
  const priorityData = getPrioritySelectorData()
  let priorityObj = {}
  priorityObj.code = priority
  priorityObj.title = priorityData.find(item => item.code == priority).title
  body.priority = priorityObj

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
