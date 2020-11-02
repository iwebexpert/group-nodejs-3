const mongoose = require('mongoose')

const Schema = mongoose.Schema

const taskSchema = Schema({
    title: {
        type: "String",
        required: true
    },
    complited: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Task', taskSchema, 'tasks')