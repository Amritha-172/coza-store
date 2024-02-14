const express = require('express');
const admin_route = express();
const adminMiddleware=require('../middleware/adminMiddleware')
const adminAuth=require('../controller/adminAuth')
const adminController=require('../controller/adminController');
const products = require('../controller/ProductController');
const multer=require('../middleware/multerMiddleware')


admin_route.set("view engine",'ejs')
admin_route.set("views","./views/admin")

admin_route.get('/',adminMiddleware.isLogout,adminAuth.adminLogin)
admin_route.post('/adminlogin',adminMiddleware.isLogout,adminAuth.adminVerify)
admin_route.get('/logout',adminAuth.adminLogout)
admin_route.get("/dashboard",adminMiddleware.isLogin,adminAuth.dashboard)
admin_route.get('/userlist',adminMiddleware.isLogin,adminController.userList)
admin_route.get('/blockuser',adminMiddleware.isLogin,adminController.blockUser)
admin_route.get('/unblockuser',adminMiddleware.isLogin,adminController.unblockUser)

admin_route.get('/category',adminMiddleware.isLogin,adminController.categories)
admin_route.get('/findcatId',adminMiddleware.isLogin,adminController.findCatId)
admin_route.get('/addcategory',adminMiddleware.isLogin,adminController.loadAddCategory)
admin_route.post('/addcategory',adminMiddleware.isLogin,adminController.addCategory)
admin_route.get('/editcategory',adminMiddleware.isLogin,adminController.loadEditCategory)
admin_route.post('/checkCategory',adminMiddleware.isLogin,adminController.checkCategory)
admin_route.post('/editcategory',adminMiddleware.isLogin,adminController.editCategory)
admin_route.get('/deletecategory',adminMiddleware.isLogin,adminController.deleteCategory)
admin_route.get('/findcategory',adminController.findCategory)

admin_route.get('/productlist',adminMiddleware.isLogin,products.loadProduct)
admin_route.post("/unblockcategory/",adminMiddleware.isLogin,adminController.unblockCategory)


admin_route.get('/addproduct',adminMiddleware.isLogin,products.loadAddProduct)
admin_route.post('/addproduct',adminMiddleware.isLogin,multer.uploadProduct,products.addProduct)
admin_route.post('/blockcategory/',adminMiddleware.isLogin,adminController.blockCategory)
admin_route.get('/unlistproduct',adminMiddleware.isLogin,products.unlistProduct)
admin_route.get('/listproduct',adminMiddleware.isLogin,products.listProduct)
admin_route.get('/editproduct',adminMiddleware.isLogin,products.loadeditProduct)   
admin_route.post('/deleteImage',products.deleteProduct)

admin_route.post('/editproduct',adminMiddleware.isLogin,multer.uploadProduct,products.editProduct)
admin_route.get('/oderDetails',adminMiddleware.isLogin,adminController.oderDetails)
admin_route.get('/singleorderview',adminMiddleware.isLogin,adminController.singleProduct)
admin_route.post('/updatestatus',adminMiddleware.isLogin,adminController.updateSts)



module.exports = admin_route;
    