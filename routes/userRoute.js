const express = require('express');

const auth=require('../middleware/userMiddleware')
const userAuth=require('../controller/userAuth')
const userController=require("../controller/userController")
const cartController=require('../controller/cartController')
const orderController=require('../controller/orderController')

const  userRoute=express()
    


// userRoute.set("view engine",'ejs')
// userRoute.set("views","./views/user")




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
userRoute.get('/shoppingcart',auth.isLogin,cartController.shoppingcart)
userRoute.get('/product',auth.isLogin,userController.singleProduct)
userRoute.post('/addcart',auth.isLogin,cartController.addToCart)
userRoute.get('/addcart/:id',auth.isLogin,cartController.itemExist)
userRoute.patch('/editprice',auth.isLogin,cartController.editPrice)
userRoute.post('/removeProduct',cartController.removeProduct)

userRoute.get('/profile',auth.isLogin,userController.profile)
userRoute.get('/editProfile',auth.isLogin,userController.loadeditProfile)
userRoute.patch('/updateprofile',auth.isLogin,userController.updateProfile)
userRoute.get('/changePassword',auth.isLogin,userController.changePass)
userRoute.post('/check-password',auth.isLogin,userController.checkpass)
userRoute.post('/passwordChange',auth.isLogin,userController.updatePass)


userRoute.post('/checkout',auth.isLogin,cartController.checkout)
userRoute.post('/checkname',auth.isLogin,orderController.checkname)
userRoute.post('/placeorder',auth.isLogin,orderController.placeorder)

userRoute.get('/userAddress',auth.isLogin,userController.address)
userRoute.post('/AddressSave',auth.isLogin,orderController.addAddress)
userRoute.post('/userAddressSave',auth.isLogin,orderController.useraddAddress)

userRoute.get('/checkout',auth.isLogin,cartController.checkout)
userRoute.get('/ordersuccess',auth.isLogin,orderController.ordersuccess)
userRoute.get('/orderpage',auth.isLogin,orderController.orderpage)
userRoute.get('/singleorder',auth.isLogin,orderController.singleorder)
userRoute.get('/addAddress',auth.isLogin,userController.addAddress)
userRoute.get('/editAddress',auth.isLogin,userController.editAddress)
userRoute.patch('/cancelorder',auth.isLogin,orderController.cancelOrder)








module.exports=userRoute