const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const Schema = mongoose.Schema

const SALT_ROUNDS = 12

const User = new Schema({
  login: {
    type: String,
    default: 'Гость',
  },
  email: {
    type: String,
    required: true,
  },
  password1: {
    type: String,
  },
})

User.pre('save', function (next) {
  if (this.isModified('password1')) {
    const salt = bcryptjs.genSaltSync(SALT_ROUNDS)
    this.password1 = bcryptjs.hashSync(this.password1, salt)
  }
  next()
})

User.method('validatePassword', function (password) {
  return bcryptjs.compareSync(password, this.password1)
})

module.exports = mongoose.model('User', User, 'users')
