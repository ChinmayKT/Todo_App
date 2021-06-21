const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const cloudinary = require('../config/cloudinary')
const upload = require('../config/multer')
const users  = require('../models/users')
const isLogin = require('../middlewere/auth')
const Todo = require('../models/Todo')


router.get('/signup',(req,res)=>{

    if(req.cookies.auth){
        return res.redirect('/profile')
    }
    
    const data = {
        title:"Signup",
        
        email : '',
        password : '',
        
        profile:'',
        error : ''
    }
    res.render('Signup',data)
})


router.post('/signup',upload.single('image'),async(req,res)=>{


    const {email,password} = req.body
    const file  = req.file

    //1.checking errors
    if( !email || !password || !file){
        const data = {
            title:"Signup",
           
            email : email,
            password:'',
           
            profile:'',
            error : 'plese enter all details'
        }
        return res.render('Signup',data)
    }

    //2.checking user exist or not
    const EmailExists = await users.findOne({email : email})
    if(EmailExists) {
        const data = {
            title:"Signup",
           
            email : email,
            password:'',
            
            profile:'',
            error : 'email already existed'
        }
        return res.render('signup',data);
    }


     //3.bcrypt the password
     const hashedpassword = bcrypt.hashSync(req.body.password,8);
    //  req.body.password = hashedpassword


    //4.creating token
     const token = jwt.sign({email:req.body.email},"secreatKey");

     const result = req.file?await cloudinary.uploader.upload(req.file.path, {folder:"profile_images/"}):'';

     const user = new users({ //user.create({})
       
        email : email, 
        password : hashedpassword,
        
        profile : result.secure_url
     })
     await user.save()

     //6.assigning tokrn and redirecting
     res.cookie('auth',token).redirect('/profile')

})


router.get('/',(req,res)=>{

    if(req.cookies.auth){
        return res.redirect('/profile')
    }

    const data = {
        title:"Login",
        email : '',
        error : ''
    }
    res.render("login",data)
})


//login - post
router.post('/',async(req, res) => {

    const {email,password} =req.body
    console.log(req.body)

    //1 error checking
    if( !email || !password ){
        const data = {
            title : "Login page",
            email  : email,
            error  : 'password or email not entered'
        }
        return res.render('login',data)
    }


    //2.checking user exist or not
    const UserExist = await users.findOne({email : email})
    if(!UserExist ){
        const data = {
            title : "Login page",
            email  : email,
            error  : "Email or Password is incorrect"
        }
        return res.render('login',data)
    } 

    

    //3.compare password
    const PasswordExists = await bcrypt.compare(password,UserExist.password);
    console.log(PasswordExists)
    if(!PasswordExists){
        const data = {
            title : "Login page",
            email  : req.body.email,
            error  : "Email or Password is incorrect"
        }
        return res.render('login',data)
    } 


    //4.generating token 
    const token = jwt.sign({email:req.body.email},'secreatKey');


    //5.send responce
    res.cookie('auth',token).redirect('/profile')

})


router.get('/profile',isLogin,async (req,res)=>{
    console.log()
    const {data} = req.body
  
    const email = data.email
    const user = await users.findOne({email : email}).populate("todoList")
    console.log("User inside profile",user)
 
    const profilePicLink = data.profile
    const data1 = {
        title:"profile",
       
        email:email,
       
        profile:profilePicLink
    }
    res.render('profile',{data:data1 , user: user})
})

router.post("/add/todo",isLogin,async (req,res)=>{
    const {todo} = req.body;
    // console.log(todo)
    const user = await users.findById({_id:req.body.data._id});
    console.log("User inside addtodo: ",user)
    const newTodo = new Todo({todo})
    newTodo.userId = req.body.data._id
    
    await newTodo.save();

    user.todoList.push(newTodo._id);
    await user.save();
    console.log("todo added")
    console.log(user)
    res.redirect("/profile")
 
})

router.get("/delete/todo/:_id",(req,res)=> {
    const {_id} = req.params
    Todo.deleteOne({_id})
    .then(()=>{
        console.log("Deleted Todo")
        res.redirect("/profile")
    }).catch((err)=>{
        console.log(err)
    })
})

router.get("/edit/:id",isLogin,async(req,res)=> {
    console.log()
    const {data} = req.body
  
    const email = data.email
    const user = await users.findOne({email : email}).populate("todoList")
    console.log("User inside profile",user)
    const etodo = await Todo.findById({_id:req.params.id});
    const profilePicLink = data.profile
    const data1 = {
        title:"profile",
       
        email:email,
       
        profile:profilePicLink
    }
    res.render('edit',{data:data1 , user: user, etodo:etodo})
})

router.post("/edit/todo/:_id", isLogin, async(req, res)=> {
    try {
        const etodo = await  Todo.findOneAndUpdate({_id:req.params._id}, {
            $set: {
                todo: req.body.todo
            }
        });

        res.redirect("/profile");
    } catch (error) {
        
    }
})

//logout -Get
router.get('/logout',(req, res) => {
    res.clearCookie('auth').redirect('/')
})

module.exports = router