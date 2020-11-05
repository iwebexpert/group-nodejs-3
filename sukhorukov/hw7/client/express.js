const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')

const methodOverride = require('method-override')
const fetch = require('node-fetch')
const LocalStorage = require('node-localstorage').LocalStorage, localStorage = new LocalStorage('./localStore')

const taskModel = require('./models/task')
const userModel = require('./models/user')

const app = express()

//посредники разные
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
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

//отображение страницы приветствия
app.get('/', (req, res) => {
  // res.status(200).send('Hello, express.js!')
  res.redirect('/tasks')
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

//запрос на регистрацию пользователя
app.post('/register', async (req, res) => {
  const { repassword, ...restBody } = req.body

  if (restBody.password === repassword) {
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: {'Content-type': 'application/json'}, 
    })

    switch (response.status) {
      case 201:
        res.redirect('/auth')
        break
      case 400:
        res.redirect('/register?error=Пароли не совпадают')
        break
      case 409:
        res.redirect('/register?error=Такая учетная запись уже существует')  
        break    
    }
  } else {
    res.redirect('/register?error=Пароли не совпадают')
  }
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

//проверка пользователя на соответствие в базе данных
app.post('/auth', async (req, res) => {
  const response = await fetch('http://localhost:4000/auth', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: {'Content-type': 'application/json'}, 
  })

  if (response.status === 401) res.redirect('/auth')
  const registeredUser = await response.json()
  localStorage.setItem('registeredUser', JSON.stringify(registeredUser))

  res.redirect('/tasks')
})


//сброс результатов проверки существования пользователя в базе данных
app.get('/logout', (req, res) => {
  localStorage.removeItem('registeredUser')
  res.redirect('/auth')
})

//запросить список задач
app.get('/tasks', async (req, res) => {
  const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

  if (registeredUser) {
    const response = await fetch('http://localhost:4000/tasks', {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${registeredUser.token}`,
      },
    })

    if (response.status === 403) res.redirect('/auth')
    const tasks = await response.json()

    const header = {
      title: `Список задач пользователя "${registeredUser.firstName ==='' ? 'Безымянный' : registeredUser.firstName}"`,
      link: [
        {
          href: '/task',
          title: 'Создать задачу',
        },
        {
          href: '/logout',
          title: `Выход`,
        },
      ],
    }

    res.render('tasks', { header, tasks })
  } else {
    res.redirect('/auth')
  } 
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

  res.render('task', { header })
})

//создание новой задачи в базе данных
app.post('/task', async (req, res) => {
  const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

  if (registeredUser) {
    let { body } = req
    if (body.completed) body.completed = true
    const task = new taskModel(body)
    task.userId = registeredUser._id

    const headers = {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${registeredUser.token}`,
    }
    
    const response = await fetch('http://localhost:4000/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
      headers 
    })

    if (response.status !== 201) res.redirect('/task') 
  } else {
    res.redirect(`/task/auth`)
  }
  
  res.redirect('/tasks')
})

//отображение формы для запроса данных на изменение задачи
app.get('/task/:id', async (req, res) => {
  const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))
  const { id } = req.params
  const response = await fetch(`http://localhost:4000/tasks/${id}`, {
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${registeredUser.token}`,
    }, 
  })
  const task = await response.json()


  const header = {
    title: `Редактирование задачи: "${task.title}"`,
    link: [
      {
        href: '/tasks',
        title: `Список задач`,
      },
    ],
  }

  res.render('task', { header, task })
})

//изменение задачи
app.patch('/task/:id', async (req, res) => {
  const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

  if (registeredUser) {
    const { id } = req.params
    let { body } = req
    if (body.completed) body.completed = true 
      else body.completed = false

    const response = await fetch(`http://localhost:4000/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${registeredUser.token}`,
      }, 
    })

    if (response.status !== 204) res.redirect(`/task/${id}`)
    
  } else {
    res.redirect(`/task/auth`)
  }
  res.redirect('/tasks')
})

//удаление задачи из базы данных
app.delete('/task/:id', async (req, res) => {
  const registeredUser = JSON.parse(localStorage.getItem('registeredUser'))

  if (registeredUser) {
    const { id } = req.params

    await fetch(`http://localhost:4000/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${registeredUser.token}`,
      }, 
    })
  } else {
    res.redirect(`/task/auth`)
  }
  res.redirect('/tasks')
})

//обработка необработаных запросов
app.get('*', (req, res) => {
  res.status(404).render('error')
})

//установка слушателя запросов клиента
app.listen(3000, () => {
  console.log('http://localhost:3000')
})
