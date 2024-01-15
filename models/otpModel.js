
const mongoose = require('mongoose');


const OTPschema  = new mongoose.Schema({
    userid :{
        type :String,
        required :true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date ,
        expires: 60,
        default:Date.now,
    },
})
OTPschema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.model("otps",OTPschema);