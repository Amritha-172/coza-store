
const mongoose = require('mongoose');


const OTPschema  = new mongoose.Schema({
    userid :{
        type :mongoose.Schema.Types.ObjectId
      
    },
    otp:{
        type:String,
      
    },
    createdAt:{
        type:Date ,
        expires: 350,
        default:Date.now,
    },
})
// OTPschema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.model("otps",OTPschema);