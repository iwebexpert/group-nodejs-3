const DEFAULT_NEWS_COUNT = 5
const express = require('express')
const request = require('request')
const hbs = require('express-handlebars')
const cookieParser = require('cookie-parser')
const cheerio = require('cheerio')
const path = require('path')
const users = require('./data/users')


const app = express()

//todo replace work with config with a class
function extractNewsConfig(req) {
    let config = req.cookies.config
    if (config === undefined) {
        config = "{}"
    }
    let {count, fresh_only} = JSON.parse(config)
    fresh_only = !!fresh_only

    if (count === undefined || count <= 0) {
        count = DEFAULT_NEWS_COUNT
    }
    return {count, fresh_only}
}

function saveNewsConfig(req, res) {
    let {count, fresh_only} = req.body
    fresh_only = fresh_only === 'on'
    count = +count
    if (count <= 0) {
        count = DEFAULT_NEWS_COUNT
    }
    res.cookie('config', JSON.stringify({count, fresh_only}))
}

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
    if (req.headers.test === '1234') {
        req.test = 'user header test sent'
    }
    next()
})

app.get('/', (req, res) => {
    res.redirect('/news')
})

app.post('/users', (req, res) => {
    console.log(req.body)
    res.status(200).send('POST!')
})

app.get('/users', (req, res) => {
    if (req.test) {
        console.log(req.test)
    } else {
        console.log('Header TEST was sent')
    }

    res.render('users', {users})
})

app.get('/users/:username', (req, res) => {
    const {username} = req.params

    const user = users[username]

    if (!user) {
        res.status(404).render('error')
    }

    res.render('user', {user})
})

app.get('/config', (req, res) => {
    const config = extractNewsConfig(req)
    res.render('config', config)
})


app.post('/config', (req, res) => {
    saveNewsConfig(req, res)
    res.redirect('/news')
})

app.get('/news', (req, res) => {
    const config = extractNewsConfig(req)
    request('https://habr.com/ru/feed/', (err, response, body) => {
        if (!err && response.statusCode === 200) {
            const $ = cheerio.load(body)
            const news = []
            $('div.news-topic', '.news-block__content')
                .filter((i, el) => {
                    if (!config.fresh_only) {
                        return true
                    }
                    const time = $(el).find('span.news-topic__attr_date-time').text()
                    return time.indexOf('вчера') === -1
                })
                .slice(0, config.count)
                .each((i, el) => {
                    const link = $(el).find('a').first()
                    news.push({href: link.attr('href'), title: link.text().trim()})
                })
            res.render('news', {news})
        }
    })

})

app.post('/news', (req, res) => {
    console.log(req.body)
})

app.get('/cookie/get', (req, res) => {
    console.log(req.cookies)
    res.send(JSON.stringify(req.cookies))
})

app.get('/cookie/set', (req, res) => {
    res.cookie('count', Math.floor(Math.random()))
    res.redirect('/cookie/get')
})

app.get('*', (req, res) => {
    res.status(404).render('error')
})


app.listen(4000, () => {
    console.log('http://localhost:4000')
})
