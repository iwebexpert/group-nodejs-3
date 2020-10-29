const express = require('express')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const path = require('path')
const {getNews} = require('./services/news')

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

app.get('/', async (req, res) => {
    const news = await getNews()
    const count = req.cookies.count
    res.render('news', {news: news.slice(0, count || news.length), count})
})

app.post('/config', (req, res) => {
    const {count} = req.body

    res.cookie('count', count)
    res.redirect('/')
})

app.use((req, res) => {
    res.status(404).render('error')
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})
