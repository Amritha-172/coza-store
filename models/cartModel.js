const mongoose = require('mongoose');

//single cart item schema
const cartItemShema=new  mongoose.Schema({
   
    prductId:{
        type:mongoose.Schema.Types.ObjectId,
            ref:"product",
            required:true
    },
    quantity:{
        type:Number,
      required:true,
      min:[1]
    },
    price:{
        type:Number,
        required:true
    }
    },
    {
        timestamps:true
    
})   

//schema for the cart

const CartShema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    items:[cartItemShema],
     totalQuantity:{
        type:Number,
        required:true,
        default:0
     },   
     totalPrice:{
        type:Number,
        required:true,
        default:0

     }

},{
    timestamps:true
})

module.exports=mongoose.model('cart',CartShema)