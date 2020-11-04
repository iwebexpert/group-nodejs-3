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
  status: {
    type: Number,
    default: 1,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Task', TaskSchema, 'tasks')