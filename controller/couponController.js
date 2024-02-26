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
 

        const couponUpdate = await Coupon.updateOne({ couponCode: couponCode }, { $set: { dicountAmount: discountAmount, expiryDate: expiryDate, description: description ,minimumAmount:minimumAmount} })
        if (couponUpdate) {
            res.redirect('/admin/Coupon')
        }


    } catch (error) {
        console.log('error in update coupon', error);
    }
}

const usercoupon = async (req, res) => {

    try {
        const coupons = await Coupon.find({})
        const formattedCoupon = coupons.map(item => {
            let status = ""
            const currentdate =  new Date();
            const fDate=  new Date(item.expireDate);
            formattedDate=moment(item.expireDate).format('YYYY-MM-DD')


            if (currentdate < fDate) {
                status = "Valid"
            } else {
                status = 'Expired'
            }

            return {
                ...item.toObject(),
                formattedDate,
                status
            }
        })

        res.render('user/user/coupon', { coupons: formattedCoupon })

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
        const { couponCode } = req.body;
        const coupon = await Coupon.findOne({ couponCode: couponCode });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        console.log('coupon', coupon);

        const currentDate = new Date();
        const expirationDate = new Date(coupon.expireDate);

        console.log('currentDate', currentDate);
        console.log('expirationDate', expirationDate);

        if (currentDate <= expirationDate) {
            

            res.status(200).json({ success: true ,coupon});
        } else {
            res.status(200).json({ success: false, message: 'Coupon has expired' });
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