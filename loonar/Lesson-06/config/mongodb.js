const { request } = require("express");

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/task2', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

module.exports = mongoose