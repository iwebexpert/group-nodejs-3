const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')

const TOKEN_SECRET_KEY = '1234ufhliuadshfdjghfoieruoewryhisdgf'

const taskModel = require('./models/task')
const userModel = require('./models/user')

const auth = require('./auth')
const app = express()

const mustBeAuthenticatedRestApi = (req, res, next) => {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(' ')

    jwt.verify(token, TOKEN_SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(403).json({msg: "Доступ запрещен!"})
        return
      }

      req.user = decoded
      next()
    })
  } else {
    res.status(403).json({msg: "Токен отсутствует!"})
  }
}

//подключение к Mongo
mongoose.connect('mongodb://localhost:27017/tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

//посредники
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

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
app.use('/tasks', mustBeAuthenticatedRestApi)

//вывод справочной инфомации при запуске сервера
app.get('/', async (req, res) => {
  res
    .status(200)
    .send(
      '<h4>Сервер запущен!</h1>\
      <ul>\
        <li>/register (POST) - регистрация пользователя</li>\
        <li>/auth (POST) - авторизация пользователя</li>\
      </ul>\
      <ul>\
        <li>/tasks (GET) - получить список задач</li>\
        <li>/tasks/id (GET) - получиь одну задачу</li>\
        <li>/tasks (POST) - создать новую задачу</li>\
        <li>/tasks/id (PATCH) - изменить задачу</li>\
        <li>/tasks/id (DELETE) - удалить задачу</li>\
      </ul>'
    )
})

//регистрация
app.post('/register', async (req, res) => {
  const { repassword, ...restBody } = req.body
  if (await userModel.findOne({ email: restBody.email })) {
    return res.status(409).json({ msg: 'Учетная запись занята' })
  }

  if (restBody.password === repassword) {
    const user = new userModel(restBody)
    await user.save()
    res.status(201).json({
      msg: 'Пользователь зарегистрирован',
    })
  } else {
    res.status(400).json({
      msg: 'У Вас не получилось повторить пароль',
    })
  }
})

//авторизация
app.post('/auth', async (req, res) => {
  const { email, password } = req.body
  const user = await userModel.findOne({ email })

  if (!user) {
    return res.status(401).send()
  }

  if (!user.validatePassword(password)) {
    return res.status(401).send()
  }

  const plainUser = JSON.parse(JSON.stringify(user))
  delete plainUser.password

  res.status(200).json({
    ...plainUser,
    token: jwt.sign(plainUser, TOKEN_SECRET_KEY),
  })
})

//получить все задачи
app.get('/tasks', async (req, res) => {
  const tasks = await taskModel.find({ userId: req.user._id }).lean()
  res.status(200).json(tasks)
})

//получить одну задачу
app.get('/tasks/:id', async (req, res) => {
  const {id} = req.params
  const task = await taskModel.findById(id).lean()
  res.status(200).json(task)
})

//создать задачу
app.post('/tasks', async (req, res) => {
  let { body } = req
  if (body.completed) body.completed = true
  const task = new taskModel(body)
  task.userId = req.user._id
  await task.save()

  res.status(201).json(task)
})

//обновление старой задачи в базе данных
app.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params
  let { body } = req
  if (body.completed) {
    body.completed = true
  } else {
    body.completed = false
  }
  await taskModel.findByIdAndUpdate(id, body).lean()

  res.status(204).send()
})

//удаление задачи из базы данных
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params
  await taskModel.findByIdAndDelete(id)

  res.status(204).send()
})

//обработка необработаных запросов
app.get('*', (req, res) => {
  res.status(404).json({msg: 'этот запрос не удалось обработать'})
})

//установка слушателя запросов
app.listen(4000, () => {
  console.log('Справочная информация по серверу: http://localhost:4000')
})
