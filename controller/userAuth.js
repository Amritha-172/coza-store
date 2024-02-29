const user = require('../models/userModel')
const util = require('../utilities/sendEmail')
const OTP = require('../models/otpModel')
const products = require('../models/productModel')
const bcrypt = require('bcrypt')
const category=require('../models/categoryModel')

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const signup = async (req, res) => {
    try {
        const messages = req.flash('message')
        res.render("user/user/register", { messages })
    } catch (error) {
        console.log("error in signup page:", error);
        res.render('error')
    }
}

const verifySignup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, mobile } = req.body
        const userCheck = await user.findOne({ email, is_verified: true })

        if (userCheck) {
            req.flash('message', "User Already Exist")
            return res.redirect('user/user/register')
        }
        if (! /^[6-9]\d{9}$/.test(mobile)){
            req.flash('message', "Password length must be 8")
            return res.render('user/user/register')
        }
        if (password !== confirmPassword) {
            req.flash('message', "Password and confirm password is not match" )
           return res.render('user/user/register')
        } 
       
        
            const spassword = await securePassword(password)

            const insertUser = new user({
                name: name,
                email: email,
                password: spassword,
                mobile: mobile
            })
            const userData = await insertUser.save()
     
            console.log(userData);
            const userId = userData._id
            req.session.user_sign = userId
            // req.session.user_name = userData.name
            req.session.user_email = userData.email
            await util.mailsender(email, userId, `It seems you logging at CoZA store and trying to verify your Email.
          Here is the verification code.Please enter otp and verify Email`)

            res.render("user/SignupOtp", { message: "enter Otp", user: req.session.user_email })
        
    } catch (error) {
        res.render('error')
        console.log("error in verify signuop:", error);
    }
}

const userLogin = async (req, res) => {
    try {
        const messages = req.flash('message')
        res.render('user/user/login', { messages })
    } catch (error) {
        console.log("error in userlogin:", error);
        res.status(500).send('Internal Server Error');
    }
}

const verifyLogin = async (req, res) => {
    try {

        const { email, password } = req.body
        const userData = await user.findOne({ email: email });
        console.log(userData);
        if (!userData) {
            req.flash('message', 'User not fount')
            return res.redirect('/login')

        }
        if (userData.is_blocked === true) {
            req.flash('message', "You have been blocked")
            return res.redirect('/login')
        }
        if (userData.is_verified === false) {
            req.flash('message', "Please verify your Account")
            return res.redirect('/login')

        }
        const passwordMatch = await bcrypt.compare(password, userData.password)
        if (!passwordMatch) {
            req.flash('message', "Password does not Math")
            return res.redirect('/login')
        }
        console.log('session in verify');
        req.session.user_id = userData._id

        return res.redirect('/home')

    } catch (error) {
        console.log("error in verify login", error.message);
        res.render('error')
    }
}


const otp = async (req, res) => {
    try {
        res.render('user/signupOtp', { user: req.session.user_email, message: "Enter OTP" })
    } catch (error) {
        console.log("error in otp:", error);
    }
}

const verifyOtp = async (req, res) => {
    try {

        console.log("otp reached");
        const { noOne, noTwo, noThree, noFour, email } = req.body
        const userData = await user.findOne({ email: email })
        console.log("verify otp", userData);
        const userID = req.session.user_sign
        const input = `${noOne}${noTwo}${noThree}${noFour}`
        console.log(input);
        console.log(userID);


        if (!userID) {
            console.log("no userid");
            return res.json({ message: 'No userId' })
        }

        const findOtp = await OTP.find({ userid: userID }).sort({ createdAt: -1 }).limit(1)
        console.log(findOtp);

        if (findOtp.length > 0) {
            const verifyOtp = await bcrypt.compare(input, findOtp[0].otp)

            console.log('verifyotp', verifyOtp);
            if (verifyOtp) {
                await user.updateOne({ _id: userID }, { $set: { is_verified: true } }).catch((err) => {
                    console.log(err);
                })

                res.json({success:true})
            } else {

                req.session.user_id=userID
                res.json({ message: 'Incorrect OTP' })

            }
        }
    } catch (error) {
        console.log("error in verifyotp:", error);
    }


}

const resendOtp = async (req, res) => {
    try {
        const userId = req.session.user_sign
        const email = req.session.user_email
        console.log("userId", userId);
        await util.mailsender(email, userId, `It seems you logging at CoZA store and trying to verify your Email.
        Here is the verification code.Please enter otp and verify Email`)
        res.status(200).json({ success: true })

    } catch (error) {
        console.log('Error in resend otp ', error);
        res.status(404).json({ success: false })
    }
}




//---------forgot otp--------------//

const forgotPass = async (req, res) => {
    try {
        const messages = req.flash('message')
        res.render('user/user/forgetPassword', { messages })
    } catch (error) {
        console.log('error in forgetpass', error);
    }
}

const forgotOtp = async (req, res) => {
    try {
        const email = req.body.email

        const existemail = await user.findOne({ email: email, is_verified: true })

        console.log(existemail);
        if (!existemail) {
            req.flash('message', "Email does not exist")
            res.redirect('/forgot')
        } else {
            req.session.email_id = email
            req.session.userid = existemail._id
            await util.mailsender(email, existemail._id, `It seems you logging at CoZA store and trying to verify your Email.
            Here is the verification code.Please enter otp and verify Email`)
            res.render('user/user/forgotOtp', { email })


        }

    } catch (error) {
        console.log('error in forgot');
    }
}

const forgotResend = async (req, res) => {
    try {

        const email = req.body.email

        const existemail = await user.findOne({ email: email })

        if (existemail) {
            await util.mailsender(email, existemail._id, `It seems you logging at CoZA store and trying to verify your Email.
            Here is the verification code.Please enter otp and verify Email`)
            res.status(200).json({ success: true })
        }

    } catch (error) {
        console.log('error in forgotResend', error);
    }
}

const forgotVerifyOtp = async (req, res) => {
    try {
        const userId = req.session.userid
        const otp = req.body.otp
       
        console.log("otp ", otp);
        console.log("userId", userId);
        const findOtp = await OTP.findOne({ userid: userId }).sort({createdAt:-1}).limit(1)
        console.log(findOtp);
        if (findOtp) {
            const verifyOtp = await bcrypt.compare(otp, findOtp.otp)
            console.log(verifyOtp);
            if (verifyOtp) {
                console.log("verify otp");
                res.json({ success: true })
            } else {
                res.json({ success: false })
            }

        }

    } catch (error) {
        console.log('error in  forgot password otp', error);
    }
}


const loadresetPass = async (req, res) => {
    try {
        res.render('user/user/forgotPasschange')


    } catch (error) {
        console.log("error in resetpassword");
    }
}

const resetPass = async (req, res) => {
    try {
        const {password}=req.body
        const userId = req.session.userid
        const oldpassword= await user.findOne({_id:userId})
        console.log("oldpassword",oldpassword);
        const oldpasswordMatch=  await bcrypt.compare(password, oldpassword.password)
        console.log("oldpasswordMatch",oldpasswordMatch);
        if(oldpasswordMatch){
           return res.json({passwordMatch:true})
        }
      
        const spassword = await securePassword(password)
        const update = await user.updateOne({ _id: userId }, { $set: { password: spassword } })
        console.log(update);
        if (update) {
            res.status(200).json({ success: true })
        } else {
            res.json({ success: false })
        }


    } catch (error) {
        console.log('error in resetpassword', error);
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.user_id = null
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

const Homepage = async (req, res) => {
    try {

        let userData = req.session.user_id;
        let userdata = await user.findOne({ _id: userData, is_blocked: false })
        let categoryData= await category.find({})
       
        let productData = await products.find({ is_blocked: false, is_categoryBlocked: false }).sort({_id:-1})

        if (userdata) {

            res.render('user/user/home', {
                userName: userData.name,
                product: productData,
                userdata: userdata,
                categoryData
            })
        } else {

            res.render('user/user/home', {

                userName: null,
                product: productData,
                userdata: null,
                categoryData

            })
        }
    } catch (error) {
        console.log("error in home after login:", error);
    }
}


const shop = async (req, res) => {
    try {
           const product=await products.find({is_blocked: false, is_categoryBlocked: false }).populate('categoryId').sort({_id:-1})
  const categories= await category.find()
         res.render('user/shop',{product,categories})
    } catch (error) {
        console.log('error in shop', error);
    }
}

const checkEmail = async (req, res) => {
    try {
        const { email } = req.body
        const check = await user.findOne({ email: email, is_verified: true })
        console.log(check);
        if (check) {
            res.status(200).json({ success: true })
        } else {
            res.json({ success: false })
        }

    } catch (error) {
        console.log('error in check email', error);
    }
}

module.exports = {
    otp,
    signup,
    verifySignup,
    userLogin,
    verifyLogin,
    userLogout,
    Homepage,
    verifyOtp,
    shop,
    checkEmail,
    resendOtp,
    forgotPass,
    forgotOtp,
    loadresetPass,
    forgotVerifyOtp,
    resetPass,
    forgotResend
}