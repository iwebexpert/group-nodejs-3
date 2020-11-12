const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    default: "Нет описания"
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model('Task', TaskSchema, 'tasks')