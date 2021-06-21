const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    todo: {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('todo',TodoSchema)