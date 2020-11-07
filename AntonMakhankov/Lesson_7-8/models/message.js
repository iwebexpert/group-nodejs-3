const mongoose = require('mongoose')
  
const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    time: {
        type : Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Message', messageSchema, 'messages')