const express = require('express');
const session = require('express-session');
const config = require('../config/config')
const auth=require('../middleware/userMiddleware')
const userController=require('../controller/userController')

const userRoute=express()

userRoute.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true
}))


userRoute.set("view engine",'ejs')
userRoute.set("views","./views/user")


userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))

userRoute.get('/',(req,res)=>{
    res.render('home')
})

userRoute.get('/login',auth.isLogout,userController.userLogin)
userRoute.post('/login',userController.verifyLogin)

userRoute.get('/home',auth.isLogin,userController.Homepage)
userRoute.post('/home',userController.Homepage)

userRoute.get('/logout',auth.isLogin,userController.userLogout)

userRoute.get('/register',auth.isLogout,userController.signup)
userRoute.post("/register",userController.insertUser)


userRoute.post('/signup',(req,res)=>{
    res.render("signupOtp")
})
userRoute.post("/newhome",(req,res)=>{
    res.render("newhome")
})

userRoute.get('/profile',(req,res)=>{
    res.render('profile')
})

module.exports=userRoute