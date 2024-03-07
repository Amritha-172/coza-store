const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
        
    },
    cartId:{
      type:[mongoose.Schema.Types.ObjectId],
      ref: 'cart',
      required:true
        },
    oderedItem: [{
        productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', 
        required: true
        },
        quantity:{
            type:Number,
            required:true
        },
        productStatus:{
            type: String,
            default:"pending",
            required: true
        },
        returReason:{
            type:String, 
        },
        totalProductAmount:{
            type:Number,
            required:true
        },
        offer_id:{
            type: mongoose.Schema.Types.ObjectId,
        }
        
      
      
    }],
    orderAmount: {
        type: Number,
        required: true,

    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"address",
        required: true,
    },
    deliveryDate:{
        type:Date
    },
    shippingDate:{
        type:Date
    },
    paymentMethod: {
        type: String,
        required: true,
   
    },
    paymentStatus:{
        type:String,
        required:true
    },
    couponDiscount:{
        type:Number
    },
    
},
{
    timestamps:true
})

module.exports=mongoose.model('order',orderSchema)