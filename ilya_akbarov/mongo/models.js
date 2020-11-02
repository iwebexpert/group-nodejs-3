const mongoose = require('mongoose')
const { Schema } = mongoose

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

const TaskModel = mongoose.model('Task', taskSchema, 'tasks')

module.exports = {
  TaskModel,
}
