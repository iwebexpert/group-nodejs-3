const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const users = require('./data/users')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))


app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'default',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
}))

app.set('view engine', 'hbs')


// работа с заголовками
app.use((req, res, next) => {
    if(req.headers.test === '1234'){
        req.test = 'user header test sent'
    }
    next()
})


app.get('/', (req, res) => {
    res.status(200).send('hello')

})

app.post('/users', (req, res) => {
    console.log(req.body)
    res.status(200).send('POST!')
})

app.post('/users', (req, res) => {
    console.log(req.body)
    res.redirect('/config')
})

app.get('/users', (req, res) => {
    if(req.test) {
        console.log(req.test)
    } else {
        console.log('Header TEST was sent')
    }

    res.render('users', {users})
})

app.get('/users/:username', (req, res) => {
    const {username} = req.params

    const user = users[username]

    if(!user) {
        res.status(404).render('error')
    }

    res.render('user', {user})
})


app.get('/config', (req, res) => {
    res.render('config')
})


app.get('*', (req, res) => {
    res.status(404).render('error')
})

app.listen(4000, () => {
    console.log('http://localhost:4000')
})