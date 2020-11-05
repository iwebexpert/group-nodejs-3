const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { Schema } = mongoose

const SALT_ROUNDS = 10

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    default: 'Guest',
  },
  password: {
    type: String,
    required: true,
  },
})

userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS)
    this.password = bcrypt.hashSync(this.password, salt)
  }
  next()
})

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

const UserModel = mongoose.model('User', userSchema, 'users')

module.exports = UserModel
