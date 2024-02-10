const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const product = require('../models/productModel')
const Address = require('../models/addressModal');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');


const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}


const loadshop = async (req, res) => {
    try {
        const productArray = await product.find({ is_categoryBlocked: false, is_blocked: false })
        res.render("user/shop", { productArray })
    } catch (error) {
        console.log("error in loadshop:", error);
        res.render('error')
    }
}
const profile = async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.session.user_id, is_blocked: false })
        let address = null
        if (userData) {
            res.render('user/user/profile', { userData: userData, Address: address })
        } else {
            res.render('error')
        }
    } catch (error) {
        console.log("Error in profile:", error)
    }
}
const loadeditProfile = async (req, res) => {
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        res.render('user/user/profileEdit', { userData })

    } catch (error) {
        console.log('error in edit profile page');
    }
}
const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user_id

        console.log(req.body);
        const { fullname, email, age, gender, phone } = req.body
        const update = await User.updateOne({ _id: userId }, { $set: { name: fullname, email: email, age: age, gender: gender, mobile: phone } })
        console.log(update);
        if (update) {
            res.status(200).json('success')

        } else {
            res.json('failed')
        }
    } catch (error) {
        console.log('error in update profile');
    }
}


const singleProduct = async (req, res,) => {
    try {

        const productId = req.query.productId

        console.log(productId, typeof (productId))

        const productData = await product.findOne({ _id: productId })

        const userData = await User.findOne({ email: req.session.user_email })

        if (productData) {
            res.render('user/singleProduct', { product: productData, userData })
        } else {
            res.render('error')
        }
    } catch (error) {
        console.log("error in Single product:", error);
        res.render('error')
    }
}


const changePass = async (req, res) => {
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId, })
        console.log("user", userData);
        res.render('user/user/changePassword', { userData })


    } catch (error) {
        console.log('error in change password');
    }
}
const checkpass = async (req, res) => {
    try {
        const {currentPassval}=req.body
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId, })
        const passwordMatch = await bcrypt.compare(currentPassval, userData.password)
        if(passwordMatch){
            res.json({success:true,message:""})
        }else{
            res.json({success:false,message:"password is incorrect"})
        }
          
    } catch (error) {
      console.log('error in check password');
    }
}


const updatePass=async(req,res)=>{
    try {
         const {newPassword}=req.body
         console.log(newPassword);
         const spassword = await securePassword(newPassword)
      
         const userId=req.session.user_id
         const update=await  User.updateOne({_id:userId},{$set:{password:spassword}})
         if(update){
            res.json({success:true})
         }else{
            res.json({success:false})
         }
       
    } catch (error) {
        console.log('error in update password');
    }
}

const address=async(req,res)=>{
    try {
         const userId=req.session.user_id
        
          const addressDetail=await Address.find({userId:userId}).populate('userId') 
          console.log("address detail",addressDetail);

        res.render('user/user/address',{addressDetail})
    } catch (error) {
        console.log("error in address");
    }
}

const addAddress=async(req,res)=>{
    try {
        res.render('user/user/addAddress')
    } catch (error) {
        console.log('error in add address');
    }
}
 const editAddress=async(req,res)=>{
    try {
        res.render('user/user/editAddress')
    } catch (error) {
        console.log("error in edit address");
    }
 }

module.exports = {
    singleProduct,
    loadshop,
    profile,
    loadeditProfile,
    updateProfile,
    changePass,
    checkpass,
    address,
    updatePass,
    addAddress,
    editAddress

}


