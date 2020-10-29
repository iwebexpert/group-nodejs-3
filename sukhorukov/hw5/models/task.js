const mongoose = require('mongoose')

const Schema = mongoose.Schema

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "Подробности отсутствуют"
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type:Number,
        default: 1
    }
})

module.exports = mongoose.model('Task', taskSchema, 'tasks')