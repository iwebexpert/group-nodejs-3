const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cors = require('cors')
const jwt = require('jsonwebtoken')
const http = require('http')
const socketIO = require('socket.io')

mongoose.connect('mongodb://127.0.0.1:27017/geoChat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const TOKEN_SECRET_KEY = '1234ufhliuadshfdjghfoieruoewryhisdgf'

const messageModel = require('./models/message')
const userModel = require('./models/user')
const passport = require('./auth')
const user = require('./models/user')

const app = express()

const server = http.Server(app)
const io = socketIO(server)

io.use((socket, next) => {
    const token = socket.handshake.query.token

    jwt.verify(token, TOKEN_SECRET_KEY, (err) => {
        if(err){
            return next(new Error('Authorization error'))
        }
        next()
    })

    return next(new Error('Authorization error'))
})

io.on('connection', (socket) => {
    console.log('New connection')

    //Обмен событиями
    socket.on('create', async (data) => {
        console.log('Event from client - create')
        const text = data.text
        const user = data.user
        const location = data.location
        if(text){
            const message = new messageModel({"text":text,"user":user,"location":location})
            const savedMessage = await message.save()
            
            socket.broadcast.emit('created', savedMessage,user)
            socket.emit('created', savedMessage,user)
        } 
    })

    socket.on('disconnect', () => {
        console.log('New disconnect')
    })
})

const mustBeAuthenticatedRestApi = (req, res, next) => {
    if(req.headers.authorization){
        const [type, token] = req.headers.authorization.split(' ')

        jwt.verify(token, TOKEN_SECRET_KEY, (err, decoded) => {
            if(err){
                return res.status(403).send()
            }

            req.user = decoded
            next()
        })
    } else {
        res.status(403).send()
    }
}

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'))
})

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'auth.html'))
})

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'signup.html'))
})

app.use('/messages', mustBeAuthenticatedRestApi)

app.get('/messages', async (req, res) => {
    const user = req.user
    const messages = await messageModel.find().limit(5).sort({time: -1}).populate({ path: 'user', select: 'name' });
    res.status(200).json(messages)
})

app.post('/messages', async (req, res) => {
    const text = req.body.text
    const user = req.body.user
    const location = req.body.location
    if(text){

        const message = new messageModel({"text":text,"user":user})
        await message.save()
        res.status(201).json(message)
        return
    }
    res.status(400).json({message: 'Error'})
})

app.post('/register', async (req, res) => {
    const data = req.body
    if(data.phone && data.name && data.password && data.repassword) {
        const {repassword, ...restBody} = req.body
        if(restBody.password === repassword){
            const checkUserExist = await userModel.findOne({"phone": restBody.phone})
            if(!checkUserExist) {
                const user = new userModel(restBody)
                await user.save()
                res.status(201).json({message: 'User created successfull'})
            } else {
                res.status(400).json({message: 'User already exist'})
            }
        } else {
            res.status(400).json({message: 'Bad Request'})
        }
        res.status(400).json({message: 'Bad Request'})
    } else {
        res.status(400).json({message: 'Bad Request'})
    }
})


app.post('/auth', async (req, res) => {
    const {phone, password} = req.body
    const user = await userModel.findOne({phone})

        if(!user){
            return res.status(400).json({message: 'Bad login or password'})
        }

        if(!user.validatePassword(password)){
            return res.status(400).json({message: 'Bad login or password'})
        }

        const plainUser = JSON.parse(JSON.stringify(user))
        delete plainUser.password

        res.status(200).json({
            ...plainUser,
            token: jwt.sign(plainUser, TOKEN_SECRET_KEY)
        })
})

app.get('*', (req, res) => {
    res.status(404).json({message: 'Bad url'})
})

server.listen(3000, () => {
    console.log('https://localhost:3000')
})