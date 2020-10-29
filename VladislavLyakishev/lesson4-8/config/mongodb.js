const { request } = require("express");

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

module.exports = mongoose