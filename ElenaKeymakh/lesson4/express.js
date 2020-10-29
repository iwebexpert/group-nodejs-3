const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const request = require('request')
const cheerio = require('cheerio')

const users = require('./data/users')

const app = express()

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

app.use((req, res, next) => {
  console.log('Middleware1')
  //console.log(req)
  //console.log(res)
  next()
})

app.use('/users', (req, res, next) => {
  console.log('Middleware2')
  next()
})

app.all('/users', (req, res, next) => {
  console.log('Middleware3')
  next()
})

//заголовки
app.use((req, res, next) => {
  console.log('Middleware4')
  console.log(req.headers)

  if(req.headers.test === '1234'){
    req.test = 'Передан пользовательский заголовок test'
  }
  next()
})

app.get('/', (req, res) => {
  res.status(200).send('Hello, express!')
})

app.get('/users', (req, res) => {
  if(req.test){
    console.log(req.test)
  } else {
    console.log('Заголовок test не передан')
  }
  //res.status(200).send('Users')
  res.render('users', {users})
})

app.get('/users/:username', (req,res) => {
  const {username} = req.params

  const user = users[username]

  if(!user){
    res.status(404).render('error')
  }

  res.render('user', {user})
})

app.post('/users', (req, res) => {
  console.log(req.body)
  res.status(200).send('Post!')
})

app.get('/config', (req, res) => {
  res.render('config')
})

app.post('/config', (req, res) => {
  console.log(req.body)
  const {param1} = req.body
  console.log(+param1)
  res.redirect('/config')

  request('https://yandex.ru/news/', (err, response, body) => {
    if(!err &&  response.statusCode === 200){
      const $ = cheerio.load(body)

      for(let i = 0; i < param1; i++){
        const newsTitle = $('.news-card__title').eq(i).text()

        const newsText = $('.news-card__annotation ').eq(i).text()

        console.log(`Заголовок: ${newsTitle}`)
        console.log(`Текст новости: ${newsText}\n`)
      }

    }
  })
})



app.get('/config/news/:newsTitle', (req,res) => {
  const {newsTitle} = req.params

  const oneNews = allNews[newsTitle]

  if(!oneNews){
    res.status(404).render('error')
  }

  res.render('oneNews', {oneNews})
})



app.get('/cookie/get', (req, res) => {
  console.log(req.cookies)
  res.send(JSON.stringify(req.cookies))
})

app.get('/cookie/set', (req, res) => {
  res.cookie('count', Math.floor(Math.random()*10))
  res.redirect('/cookie/get')
})

//Вариант1
//app.use((req, res) => {
  //res.status(404).render('error')
//})

//Вариант2
app.get('*', (req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})