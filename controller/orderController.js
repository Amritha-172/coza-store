const address = require('../models/addressModal');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const { deleteMany } = require('../models/otpModel');
const product = require('../models/productModel')


const useraddAddress=async(req,res)=>{
    try {

      const userId=req.session.user_id;
      console.log(req.body);
       const {addressType,alternativePhone,landmark,mobile,state,city,streetAddress,locality,pincode,name}=req.body
      
      const newAddress=new address({
        userId:userId,
        name:name,
        mobile:mobile,
        pincode:pincode,
        addressType:addressType,
        streetAddress:streetAddress,
        city:city,
        landmark:landmark,
        alterPhone:alternativePhone,
        locality:locality,
        state:state
        
      })
     const save = await newAddress.save()
     console.log(save);
     if(save){
         res.redirect('/userAddress')

     }else{
        res.status(400).json({success:false})
    }
    
    } catch (error) {
        console.log('error in add address',error);
    }
}
const addAddress=async(req,res)=>{
    try {

      const userId=req.session.user_id;
      console.log(req.body);
       const {addressType,alternativePhone,landmark,mobile,state,city,streetAddress,locality,pincode,name}=req.body
      
      const newAddress=new address({
        userId:userId,
        name:name,
        mobile:mobile,
        pincode:pincode,
        addressType:addressType,
        streetAddress:streetAddress,
        city:city,
        landmark:landmark,
        alterPhone:alternativePhone,
        locality:locality,
        state:state
        
      })
     const save = await newAddress.save()
     console.log(save);
     if(save){
         res.redirect('/checkout')

     }else{
        res.status(400).json({success:false})
    }
    
    } catch (error) {
        console.log('error in add address',error);
    }
}
const checkname=async(req,res)=>{
    try {
        const {name}=req.body
        console.log(name);
        if(!name ||name.trim()==''){
            res.json({success:false})
        }else{
            res.json({success:true})
        }
    } catch (error) {
        console.log('error in check name');
    }
}



 const placeorder=async(req,res)=>{
    try {
          const {newTotal ,selectedAddress,selectedPaymentMethod}=req.body
          const userId=req.session.user_id
        const cartItems=await Cart.find({userId:userId})
        
         const orderedItem=await cartItems.map(item=>({
            productId: item.productId,
            quantity: item.quantity
         }))

         for(let item of orderedItem ){
            const { productId, quantity } = item
         const products = await product.updateOne({_id:productId},{$inc:{quantity:-quantity}});
            console.log('update product',product);
         }
         

         const order=new Order({
            userId:userId,
            cartId:cartItems.map(item => item._id),
            oderedItem:orderedItem,
            orderAmount:newTotal,
            deliveryAddress:selectedAddress,
            paymentMethod:selectedPaymentMethod,
            orderStatus:'pending'
         })
       const save=  await order.save()

     const del=await Cart.deleteMany({userId:userId})
     
     console.log(del);
       console.log(save);
       if(save){
          res.status(200).json({success:true})
       }
       else{
        res.status(302).json({success:false})
       }
            
        



    } catch (error) {
           console.log('error in place order page',error);
    }
 }
 const ordersuccess=async(req,res)=>{
    try {
        const userId=req.session.user_id
        const orderDetail=await Order.findOne({userId:userId})
      
        const formattedCreatedAt = orderDetail.createdAt.toLocaleDateString('en-US', {
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
          });
          
        console.log(orderDetail.deliveryAddress);
        const addressID=orderDetail.deliveryAddress
        const findAddress= await address.findOne({_id:addressID})
        
          console.log(formattedCreatedAt);

        res.render('user/orderSuccess',{orderDetail,formattedCreatedAt,findAddress})
    } catch (error) {
        console.log('error in order details page');
    }
 }
 const  orderpage=async(req,res)=>{
    try {
        const userId=req.session.user_id
        console.log(userId);
        const orderDetails = await Order.find({ userId: userId }).populate('oderedItem.productId')
        console.log("order details",orderDetails);
        res.render('user/user/orderpage',{orderDetails})
        
        
    } catch (error) {
        console.log('error in orderpage',error);
    }
 }

 const singleorder=async(req,res)=>{
     try {
    const orderId=req.query.orderId
    const productId=req.query.productId
    console.log(orderId);
      const orderDetails =await Order.findOne({_id:orderId}).populate('deliveryAddress')
     const productDetails= await product.findOne({_id:productId})
        
      
        res.render('user/user/singleOrder',{orderDetails,productDetails})
        
     } catch (error) {
        console.log("error in singleorder");
     }
 }
 const cancelOrder=async(req,res)=>{
    try {
             const {orderId}=req.body
             console.log(orderId);
             const cancel=await Order.updateOne({_id:orderId},{$set:{orderStatus:"cancelled"}})
             if(cancel){
             res.status(200).json({success:true})
             }else{
                res.status(302).json({success:false})
    }
} catch (error) {
        console.log('error in cancel order',error);
    }
 }
 
module.exports={
    addAddress,
    checkname,
    ordersuccess,
    placeorder,
    orderpage,
    singleorder,
    useraddAddress,
    cancelOrder
}



