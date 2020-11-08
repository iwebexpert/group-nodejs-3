const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const Schema = mongoose.Schema

const SALT_ROUNDS = 12

const userSchema = new Schema({
    phone: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})

userSchema.pre('save', function(next){
    if(this.isModified('password')){
        const salt = bcryptjs.genSaltSync(SALT_ROUNDS)
        this.password = bcryptjs.hashSync(this.password, salt)
    }
    next()
})

userSchema.methods.validatePassword = function(password){
    return bcryptjs.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema, 'users')