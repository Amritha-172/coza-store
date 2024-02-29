const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const product = require('../models/productModel')
const Address = require('../models/addressModal');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Wallet=require('../models/walletModel');
const moment = require('moment')
const Category=require('../models/categoryModel')

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
            res.render('user/user/profile', {userData, Address: address })
        } else {
            res.render('error')
        }
    } catch (error) {
        console.log("Error in profile:", error)
    }
}

const loadeditProfile = async (req, res) => {
    try {
        const messages=req.flash('message')
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        res.render('user/user/profileEdit', { userData ,messages})

    } catch (error) {
        console.log('error in edit profile page');
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user_id

        console.log(req.body);
        const { fullname, email, age, gender, phone } = req.body

        if(!fullname||fullname.trim()==" "){
           req.flash("message","User name is required")
           return res.redirect('/user/profileEdit')
        }
        if(phone.length!==10){
            req.flash("message","Please Enter valid number")
           return res.redirect('/user/profileEdit')
        }

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
        const productData = await product.findOne({ _id: productId })
        
        const categoryData=await product.find({categoryId:productData.categoryId,_id:{$ne:productId}})
        const userData = await User.findOne({_id: req.session.user_id })
        console.log("userData",userData);
        if (productData) {
            res.render('user/singleProduct', { product: productData, userData ,categoryData,userData})
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
         const {newPassword,confirmPassword}=req.body
         console.log('newPassword',newPassword);
         console.log('confirmPassword',confirmPassword);

         if(newPassword!==confirmPassword){
            
            req.flash('message',"Password is not matching")
            return res.redirect('user/user/changePassword')
         }
         
         if(!newPassword||newPassword.trim()==" "){
            
            req.flash('message',"Password is required")
            return res.redirect('user/user/changePassword')
         }
         if(newPassword.lenght<8){
          
            req.flash('message',"Password length must be 8")
            return res.redirect('user/user/changePassword')
         }
    
         const spassword = await securePassword(newPassword)
      
         const userId=req.session.user_id
         const update=await  User.updateOne({_id:userId},{$set:{password:spassword}})
           req.session.user_id=null
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
        const messages=req.flash('message')
         const userId=req.session.user_id
        
          const addressDetail=await Address.find({userId:userId}).populate('userId') 
          console.log("address detail",addressDetail);

        res.render('user/user/address',{addressDetail,messages})
    } catch (error) {
        console.log("error in address");
    }
}

const addAddress=async(req,res)=>{
    try {
        const messages=req.flash('message')
        res.render('user/user/addAddress',{messages})
    } catch (error) {
        console.log('error in add address');
    }
}

 const loadeditAddress=async(req,res)=>{
    try {
        const messages=req.flash('message')
        const {adddressId}=req.query
         const address=await Address.findOne({_id:adddressId})
        res.render('user/user/editAddress',{address,messages})
    } catch (error) {
        console.log("error in edit address");
    }
 }

  const editAddress=async(req,res)=>{
   try {
    const {name,mobile,pincode,locality,streetAddress,city,state,landmark,addressType,id}=req.body
    // if(!name||name.trim()==" "){
    //     req.flash('message',"user Name is required")
    //     return res.redirect('/user/addAddress')
    //  }
     
    //  if(mobile.lenght!==10){
    //   req.flash('message',"Please Enter Valid Number")
    //   return res.redirect('/user/addAddress')
    //  }
     
    //  if(pincode!==6){
    //   req.flash('message',"Please Enter Valid Pincode")
    //   return res.redirect('/user/addAddress')
    //  }

 
    const details=await Address.updateOne({_id:id},{$set:{name:name,mobile:mobile,pincode:pincode,locality:locality,streetAddress:streetAddress,city:city,state:state,landmark:landmark,addressType:addressType}})
      if(details){
        res.redirect('/userAddress')
      }
   } catch (error) {
    console.log('error in editAddress',error);
   }
  }

   const deleteAddress=async(req,res)=>{
    try {
        const{adddressId}=req.query
        const remove=await Address.deleteOne({_id:adddressId})
        if(remove){
            res.redirect('/userAddress')
        }
        
    } catch (error) {
        console.log('error in delete address');
    }
   }
  
const wallet=async(req,res)=>{
    try {
        const userId=req.session.user_id
        const WalletDetails=await Wallet.findOne({userId:userId})
        
        if(WalletDetails){

        
          const formattedTransactions = WalletDetails.transaction.map(transaction=>{
            const formattedDate = moment(transaction.date).format('YYYY-MM-DD');
            return {
                ...transaction.toObject(),
                 formattedDate, 
              }
        
          })
          
          const formattedWallet={
            ...WalletDetails.toObject(),
            transaction:formattedTransactions
          }
         
     
        res.render('user/user/wallet',{WalletDetails:formattedWallet})
        }else{
            res.render('user/user/wallet',{WalletDetails:0})
        }
    } catch (error) {
        console.log('error in wallet page');
    }
}

const addWallet=async(req,res)=>{
    try {
        const { Amount}=req.body
         const userId=req.session.user_id
         const WalletDetail= await Wallet.findOne({userId:userId})
         if(!WalletDetail){

            const newWallet = new Wallet({
                userId: userId,
                balance: Amount,
                tratransaction: [{
                    amount: Amount,
                    transactionsMethod: "Debit",
                }]

            })
            await newWallet.save()

         }else{
            await Wallet.updateOne({ userId: userId }, { $inc: { balance:Amount  }, $push: { transaction: { amount: Amount, transactionsMethod: "Debit" } } })
         }
         res.status(200).json({success:true})
        
    } catch (error) {
        res.status(302).json({success:false})
        console.log('error in add wallet',error);
    }
}

const wishlist=async(req,res)=>{

    try {
        const userId=req.session.user_id
        const userData= await User.findOne({_id:userId}).populate('wishlist')
     
        res.render('user/user/wishlist',{userData})
    } catch (error) {
        console.log('error in wishlist');
    }
}

const addWishlist=async(req,res)=>{
    try {
         const{productId}=req.body
         const userId=req.session.user_id
         const wishlist=await User.updateOne({_id:userId},{$push:{wishlist:productId }})
         console.log(wishlist);
         res.status(200).json({success:true})  
      
    } catch (error) {
        console.log('error in add wishlist');
    }
}

const removeWishlist=async(req,res)=>{
    try {
        const{productId}=req.body
        console.log(req.body);
        const userId=req.session.user_id
        const removewishlist=await User.updateOne({_id:userId},{$pull:{wishlist:productId }})
        console.log("removewishlist",removewishlist);
        if(removewishlist){
            res.status(200).json({success:true})
        }else{
            res.json({success:false})
        }

    } catch (error) {
        console.log("error in remove wishlist",error);
    }
}

const checkWishlist=async(req,res)=>{
    try {
        const {productId}=req.body
        const userId= req.session.user_id
        const userData=await User.findOne({_id:userId})
        const isInWishlist = userData.wishlist.some(item => item.toString() === productId);
        res.json({success:isInWishlist})
        
    } catch (error) {
        console.log('error in wishlist check',error);
        res.status(500).json({success:false})
    }
}

const about=async(req,res)=>{
    try {
        res.render('user/about')
        
    } catch (error) {
        console.log('error inn about page',error);
    }
}

const contact=async(req,res)=>{
    try {
        res.render('user/contact')
    } catch (error) {
        console.log('error in contact page');
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
    loadeditAddress,
    editAddress,
    deleteAddress,
    wallet,
    wishlist,
    addWishlist,
    removeWishlist,
    checkWishlist,
    addWallet,
    about,
    contact
}


