
const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

const userShema= mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
         type: String,
         required: true,  
    },
    mobile:{
        type:Number,
        required:true
    },
    // image:{
    //     type:String,
    //      required: true
    // },
    password:{
        type:String,
        required:true
    },
    confirmPassword:{
        type:String,
        required:true
    },
    is_blocked:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('user',userShema)