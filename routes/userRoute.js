const express = require('express');

const auth=require('../middleware/userMiddleware')
const userAuth=require('../controller/userAuth')
const userController=require("../controller/userController")

const  userRoute=express()


userRoute.set("view engine",'ejs')
userRoute.set("views","./views/user")




// userRoute.get('/',auth.isLogin,userAuth.Homepage)
// userRoute.post('/',userAuth.Homepage)
userRoute.get('/',userAuth.Homepage)
userRoute.get('/home',auth.isLogin,userAuth.Homepage)
userRoute.get('/login',auth.isLogout,userAuth.userLogin)
userRoute.post('/login',auth.isLogout,userAuth.verifyLogin)


userRoute.get('/logout',userAuth.userLogout)

userRoute.get('/register',userAuth.signup)



userRoute.get('/signup',auth.isLogout,userAuth.signup)
userRoute.post('/signup',userAuth.verifySignup)

userRoute.get('/signupOtp',auth.isLogout,userAuth.otp)
userRoute.post('/signupOtp',userAuth.verifyOtp)
userRoute.get('/shops',auth.isBlocked,userAuth.shop)
userRoute.get('/home',auth.isLogin,auth.isBlocked,userAuth.Homepage)
userRoute.get('/shoppingcart',auth.isLogin,userController.shoppingcart)
userRoute.get('/product',auth.isLogin,userController.singleProduct)
userRoute.get('/checkout',(req,res)=>{
    res.render('checkOut')
})

userRoute.get('/profile',(req,res)=>{
    res.render('profile')
})

module.exports=userRoute