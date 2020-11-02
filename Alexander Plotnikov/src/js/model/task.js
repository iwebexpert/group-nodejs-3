const { Schema, model } = require('mongoose')
const moment = require('moment')

const Task = new Schema({
  task: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    default: 'high',
  },
  status: {
    type: String,
    default: 'waiting',
  },
  date: {
    type: String,
    default: `${moment().format('YYYY-MM-DD')}`,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
  },
})

module.exports = model('tasks', Task)
