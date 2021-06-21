const mongoose = require('mongoose')

let userSchema =  mongoose.Schema({
   
    email : {type:String, required:true},
    password : {type:String, required:true},
    
    profile: {type:String, required:true},
    todoList: {type:[mongoose.Schema.Types.ObjectId],
    ref : "todo"}
})


module.exports = mongoose.model('users',userSchema);