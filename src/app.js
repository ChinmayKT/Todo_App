
const express = require('express')
require('dotenv').config()
const path = require('path')
const mongoose = require('mongoose')

const cookie = require('cookie-parser')
const app = express()
const port = process.env.PORT

//db connection
const uri = process.env.MONGO_URI
const db = async()=>await mongoose.connect(uri,{useUnifiedTopology:true,useNewUrlParser:true},()=>{
    console.log("Db connected!!")
})
db()


//body setup
app.use(express.json())
app.use(express.urlencoded({extended:true}))


//setup for view engine
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))


app.use(cookie())


const authRoute = require('./routes/Register')
app.use('/',authRoute)


//port listening
app.listen(port,()=>{console.log(`listening on port ${port}`)})