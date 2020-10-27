const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const newsParser = require('./modules/newsParser')

const app = express()

let newsCount = 128

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

app.get('/', (req, res) => {
  newsParser.then((news) => {
    if (req.cookies.newsCount) {
      newsCount = req.cookies.newsCount
    } else {
      newsCount = 128
    }
    let limitedNews = news.slice(0, newsCount)
    res.render('news', {limitedNews})
  })
})

app.get('/config', (req, res) => {
  if (req.cookies.newsCount) {
    newsCount = req.cookies.newsCount
  } else {
    newsCount = 128
  }
  res.render('config', {newsCount})
})

app.post('/config', (req, res) => {
  const {news} = req.body
  newsCount = news
  res.cookie('newsCount', newsCount)
  res.redirect('/config')
})

app.get('*', (req, res) => {
  res.status(404).render('error')
})

app.listen(4000, () => {
  console.log('http://localhost:4000')
})