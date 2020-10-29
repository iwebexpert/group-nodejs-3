const mongoose = require("mongoose");
const express = require("express");
const Schema = mongoose.Schema;
const app = express();
const jsonParser = express.json();

const taskScheme = new Schema({title: String, completed: Boolean}, {versionKey: false});
const Task = mongoose.model("Task", taskScheme);

app.use(express.static(__dirname + "/public"));

mongoose.connect("mongodb://localhost:27017/tasks", { useNewUrlParser: true }, function(err){
    if(err) return console.log(err);
    app.listen(4000, function(){
        console.log("Сервер ожидает подключения...");
    });
});

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
    const taskComleted = req.body.completed;
    const task = new Task({title: taskTitle, completed: taskComleted});

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

app.put("/api/tasks", jsonParser, function(req, res){

    if(!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const taskTitle = req.body.title;
    const taskComleted = req.body.completed;
    const newTask = new Task({title: taskTitle, completed: taskComleted});
    console.log(newTask);

    Task.findOneAndUpdate({_id: id}, newTask, {new: true}, function(err, task){
        if(err) return console.log(err);
        res.send(task);
    });
});