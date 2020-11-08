const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const http = require('http')
const socketIO = require('socket.io')
const fetch = require('node-fetch')
const { response } = require('express')
const LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./localStore')

// const methodOverride = require('method-override')

const TOKEN_SECRET_KEY = '1234ufhliuadshfdjghfoieruoewryhisdgf'

const app = express()
const server = http.Server(app)
const io = socketIO(server)

//посредник проверки токена при работе с сокетами
io.use((socket, next) => {
  const token = socket.handshake.query.token

  localStorage.setItem('token', token)
  jwt.verify(token, TOKEN_SECRET_KEY, (err) => {
    if(err){
        return next(new Error('Authorization error'))
    }

    next()
  })

  return next(new Error('Authorization error'))
})

//работа с событиями сокетов
io.on('connection', (socket) => {
  const token = localStorage.getItem('token')
  socket.on('create', async (data) => {
    if (data.completed) data.completed = true
    const headers = {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  
    fetch('http://localhost:4000/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
      headers 
    })
    .then((response) => {
      if (response.status === 201) {
        socket.broadcast.emit('created')
        socket.emit('created')
      }
    })
  })

  socket.on('update', async (data) => {
    if (data.completed) data.completed = true
    const headers = {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  
    fetch(`http://localhost:4000/tasks/${data.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data.data),
      headers 
    })
    .then((response) => {
      if (response.status === 204) {
        socket.broadcast.emit('updated')
        socket.emit('updated')
      }
    })
  })

  socket.on('delete', async (id) => {
    fetch(`http://localhost:4000/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }, 
    })
    .then((response) => {
      if (response.status === 204) {
        socket.broadcast.emit('deleted')
        socket.emit('deleted')
      }
    })
  })
})

//посредники разные
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
// app.use(methodOverride('_method'))

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

//отображение страницы приветствия
app.get('/', (req, res) => {
  res.redirect('/tasks') // страница приветствия пока отсутствует
})

//отображение формы регистрации
app.get('/register', (req, res) => {
  const { error } = req.query
  const header = {
    title: 'Регистрация',
    link: [
      {
        href: '/auth',
        title: 'У меня уже есть учетная запись',
      },
    ],
  }

  res.render('auth', { error, header, isRegForm: true })
})

//отображение формы авторизации
app.get('/auth', (req, res) => {
  const { error } = req.query
  const header = {
    title: 'Авторизация',
    link: [
      {
        href: '/register',
        title: 'У меня ещё нет учётной записи',
      },
    ],
  }

  res.render('auth', { error, header })
})

//отображение списка задач
app.get('/tasks', async (req, res) => {
  const header = {
    title: `Список задач`,
    link: [
      {
        href: '/task',
        title: 'Создать задачу',
      },
      {
        id: 'logout',
        title: `Выход`,
      },
    ],
  }

  res.render('tasks', {header})
})

//отображение формы создания задачи
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

  res.render('task', { header, new: true })
})

// //запрос на создание новой задачи
// app.post('/task', async (req, res) => {
//   const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

//   if (registeredUser) {
//     let { body } = req
//     if (body.completed) body.completed = true
//     body.userId = registeredUser._id

//     const headers = {
//       'Content-type': 'application/json',
//       'Authorization': `Bearer ${registeredUser.token}`,
//     }
    
//     const response = await fetch('http://localhost:4000/tasks', {
//       method: 'POST',
//       body: JSON.stringify(body),
//       headers 
//     })

//     if (response.status !== 201) res.redirect('/task') 
//   } else {
//     res.redirect(`/task/auth`)
//   }
  
//   res.redirect('/tasks')
// })

//отображение формы изменение задачи
app.get('/task/:id', async (req, res) => {
  // const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))
  const { id } = req.params
  // const response = await fetch(`http://localhost:4000/tasks/${id}`, {
  //   headers: {
  //     'Content-type': 'application/json',
  //     'Authorization': `Bearer ${registeredUser.token}`,
  //   }, 
  // })
  // const task = await response.json()


  const header = {
    title: `Редактирование задачи: `,
    link: [
      {
        href: '/tasks',
        title: `Список задач`,
      },
    ],
  }

  res.render('task', { header, id })
})

// //запрос на изменение задачи
// app.patch('/task/:id', async (req, res) => {
//   const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

//   if (registeredUser) {
//     const { id } = req.params
//     let { body } = req
//     if (body.completed) body.completed = true 
//       else body.completed = false

//     const response = await fetch(`http://localhost:4000/tasks/${id}`, {
//       method: 'PATCH',
//       body: JSON.stringify(body),
//       headers: {
//         'Content-type': 'application/json',
//         'Authorization': `Bearer ${registeredUser.token}`,
//       }, 
//     })

//     if (response.status !== 204) res.redirect(`/task/${id}`)
    
//   } else {
//     res.redirect(`/task/auth`)
//   }
//   res.redirect('/tasks')
// })

// //запрос на удаление задачи
// app.delete('/task/:id', async (req, res) => {
//   const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

//   if (registeredUser) {
//     const { id } = req.params

//     await fetch(`http://localhost:4000/tasks/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'Content-type': 'application/json',
//         'Authorization': `Bearer ${registeredUser.token}`,
//       }, 
//     })
//   } else {
//     res.redirect(`/task/auth`)
//   }
//   res.redirect('/tasks')
// })

//обработка необработаных запросов
app.get('*', (req, res) => {
  res.status(404).render('error')
})

//установка слушателя запросов клиента
server.listen(3000, () => {
  console.log('http://localhost:3000')
})
