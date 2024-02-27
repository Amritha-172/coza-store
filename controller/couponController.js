const Coupon = require('../models/couponModel');
const moment = require('moment');
const { find } = require('../models/otpModel');


const coupon = async (req, res) => {
    try {
        const message=req.flash('message')
        const coupons = await Coupon.find({}).sort({_id:-1})

        const formattedCoupon = coupons.map(item => {
            const formattedDate = moment(item.expireDate).format('DD-MM-YYYY')
            return {
                ...item.toObject(),
                formattedDate,
            }
        })

        res.render('couponPage', { coupons: formattedCoupon ,message})
    } catch (error) {
        console.log("error in coupon page");
    }
}

const addCoupon = async (req, res) => {
    try {
        const { couponCode, discountAmount, description, expiryDate,minimumAmount } = req.body

         if(!discountAmount||discountAmount.trim()==""||discountAmount<1){

           return res.json({success:false,message:"Please Enter valid number"})
               
         }
         if(Number(minimumAmount) < Number(discountAmount)){
            return res.json({success:false,message:"Discount Amount is greater than Minimum amount"})
         }

        console.log("coupon", req.body);

        const coupon = new Coupon({
            couponCode: couponCode,
            dicountAmount: discountAmount,
            description: description,
            minimumAmount:minimumAmount,
            expireDate: expiryDate

        })
        await coupon.save()
        res.status(200).json({success:true})

    } catch (error) {
        console.log('error in coupon controller');
    }
}

const editCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body
        const couponDetails = await Coupon.findOne({ couponCode: couponCode })
        console.log(couponDetails);
        if (couponDetails) {
            res.status(200).json({ couponDetails })
        } else {
            res.status(302).json({ Success: false })
        }


    } catch (error) {
        console.log('error in in edit coupon', error);
    }
}

const updateCoupon = async (req, res) => {
    try {

        const { discountAmount, expiryDate, description, couponCode,minimumAmount } = req.body
        console.log("req.body",req.body);
       
        if(!discountAmount||discountAmount.trim()==""||discountAmount<1){

            return res.json({success:false,message:"Please Enter valid number"})
                
          }
          if(Number(minimumAmount) < Number(discountAmount)){
             return res.json({success:false,message:"Discount Amount is greater than Minimum amount"})
          }
 
        const couponUpdate = await Coupon.updateOne({ couponCode: couponCode }, { $set: { dicountAmount: discountAmount, expireDate: expiryDate, description: description ,minimumAmount:minimumAmount} })
        if (couponUpdate) {
            res.status(200).json({success:true})
        }


    } catch (error) {
        console.log('error in update coupon', error);
    }
}

const usercoupon = async (req, res) => {

    try {
       const {coupon}=req.body
      const couponDetails=await Coupon.findOne({couponCode:coupon})
      console.log('couponDetails',couponDetails);

      req.session.coupon=couponDetails
      
      if(couponDetails){
        res.status(200).json({success:true,couponDetails})
      }else{
        res.json({success:false})
      }


    } catch (error) {
        console.log('error in coupon', error);
    }
}

const deleteCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body
       
        const coupon = await Coupon.deleteOne({couponCode: couponCode })
        console.log(coupon);
        if (coupon.deletedCount > 0) {
            res.status(200).json({success:true})
        } else {
            res.json({ success: false })
        }

    } catch (error) {
        console.log("error in delete coupon backend", error);
    }
}

const checkCoupon = async (req, res) => {
    try {
        const { Amount } = req.body;
      
           const couponDetails =await Coupon.find({minimumAmount:{$lte:Amount}})
     
            if(!couponDetails){
                res.json({success:false})
            }else{
                res.status(200).json({success:true,couponDetails})
            }
        
    } catch (error) {
        console.error('error in checkCoupon', error);
        res.status(500).json({ success: false, message: 'An error occurred while checking the coupon' });
    }
};


module.exports = {
    addCoupon,
    coupon,
    editCoupon,
    updateCoupon
    , usercoupon,
    deleteCoupon,
    checkCoupon
}