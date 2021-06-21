const jwt = require('jsonwebtoken')
const users  = require('../models/users')
require('dotenv').config();

//checking is logedin or not
 const isLogin = async(req,res,next) => {

    // console.log(req)
     
    const authToken = req.cookies.auth;

    // console.log(authToken)
   
    if(!authToken ){
        return res.redirect('/')
    }

    //verifying the token if token exist
    try {
        let payload = jwt.verify(authToken,"secreatKey",async(err,res)=>{
            if(err){
                console.log("Invalid Token")
                return res.clearCookie('auth').redirect('/')   
            }
             req.body.data = await users.findOne({email :res.email}).lean()
            next()   
        });

    }catch(e){
        console.log(e)
    }
 }


module.exports = isLogin;
