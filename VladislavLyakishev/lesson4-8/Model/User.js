const mongoose = require('mongoose')
const bcryptjs = require('bcrypt')

const Schema = mongoose.Schema

const SALT_ROUNDS = 10

const userSchema = Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.pre('save', function (next) {
    if(this.isModified('password')){
        const salt = bcryptjs.genSaltSync(SALT_ROUNDS)
        this.password = bcryptjs.hashSync(this.password, salt)
    }
    next()
})

userSchema.methods.validatePassword = function(password){
    return bcryptjs.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema, 'user')