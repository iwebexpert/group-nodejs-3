const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();
const hbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cookieParser = require('cookie-parser')
const path = require('path')

const users = require('./data/users')
const userModel = require('./models/user')
const passport = require('./auth')
const taskScheme = new Schema({title: String, completed: Boolean}, {versionKey: false});
const Task = mongoose.model("Task", taskScheme);

app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://localhost:27017/tasks", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}, function(err){
    if(err) return console.log(err);
    app.listen(4000, function(){
        console.log("Сервер ожидает подключения...");
    });
});

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static('public'))

app.use('/', passport.mustBeAuthenticated)


app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'default',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
}))
app.set('view engine', 'hbs')

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234dfshkhgfoifdguoifdsgufisdugfjug',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.get("/api/tasks", function(req, res){

    Task.find({}, function(err, tasks){

        if(err) return console.log(err);
        res.send(tasks)
    });
});

app.get("/api/tasks/:id", function(req, res){

    const id = req.params.id;
    Task.findOne({_id: id}, function(err, task){

        if(err) return console.log(err);
        res.send(task);
    });
});

app.post("/api/tasks", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const taskTitle = req.body.title;
    const taskCompleted = req.body.completed;
    const task = new Task({title: taskTitle, completed: taskCompleted});

    task.save(function(err){
        if(err) return console.log(err);
        res.send(task);
    });
});

app.delete("/api/tasks/:id", function(req, res){

    const id = req.params.id;
    Task.findByIdAndDelete(id, function(err, task){

        if(err) return console.log(err);
        res.send(task);
    });
});

// app.put("/api/tasks", jsonParser, function(req, res){
//
//     if(!req.body) return res.sendStatus(400);
//     const id = req.body.id;
//     const taskTitle = req.body.title;
//     const taskCompleted = req.body.completed;
//     const newTask = new Task({title: taskTitle, completed: taskCompleted});
//     console.log(newTask);
//
//     Task.findOneAndUpdate({_id: id}, newTask, {new: true}, function(err, task){
//         if(err) return console.log(err);
//         res.send(task);
//     });
//     // Task.findOneAndUpdate({_id: id}, {title: taskTitle, completed: taskCompleted, {new: true},
//     // if(err) return console.log(err);
//     //     res.send(task);
//     // });
// });

app.put("/api/tasks", jsonParser, function(req, res){

    if(!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const taskTitle = req.body.title;
    const taskCompleted = req.body.completed;

    Task.findOneAndUpdate({_id: id}, {title: taskTitle, completed: taskCompleted}, {new: true}, function(err, task){
        if(err) return console.log(err);
        res.send(task);
    });
});

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body

    if(restBody.password === repassword){
        const user = new userModel(restBody)
        await user.save()
        res.redirect('/auth')
    } else {
        res.redirect('/register?err=repassword')
    }
})

app.get('/auth', (req, res) => {
    const {error} = req.query
    res.render('auth', {error})
})

app.post('/auth', passport.authenticate)

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})