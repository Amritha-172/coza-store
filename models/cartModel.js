const mongoose = require('mongoose');

//single cart item schema
const cartItemShema=new  mongoose.Schema({
   
    productId:{
        type:mongoose.Schema.Types.ObjectId,
            
            required:true
    },
    quantity:{
        type:Number,
      required:true,
      min:[1],
     
    },
    price:{
        type:Number,
        required:true
    } ,userId:{
        type:mongoose.Schema.Types.ObjectId,
       
        required:true
    }
    },
    {
        timestamps:true
    
})   

//schema for the cart


module.exports=mongoose.model('cart',cartItemShema)