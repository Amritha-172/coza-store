const user = require('../models/userModel')
const util = require('../utilities/sendEmail')
const OTP = require('../models/otpModel')
const products = require('../models/productModel')
const bcrypt = require('bcrypt')

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
        res.render("user/register", { messages })
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
            return res.redirect('user/register')
        } else if (password != confirmPassword) {

            res.render('user/register', { messages: "Password and confirm password is not match" })
        } else {
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
            // req.session.user_email = userData.email
            await util.mailsender(email, userId, `It seems you logging at CoZA store and trying to verify your Email.
          Here is the verification code.Please enter otp and verify Email`)

            res.render("user/SignupOtp", { message: "enter Otp", user: req.session.user_email })
        }
    } catch (error) {
        res.reder('error')
        console.log("error in verify signuop:", error);
    }
}
const userLogin = async (req, res) => {
    try {
        const messages = req.flash('message')
        res.render('user/login', { messages })
    } catch (error) {
        console.log("error in userlogin:", error);
        res.status(500).send('Internal Server Error');
    }
}

const verifyLogin = async (req, res) => {
    try {

        const {email,password}=req.body
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

        if (!userID) {
            console.log("no userid");
        }
        const findOtp = await OTP.find({ userid: userID }, { otp: 1, _id: 0 }).sort({ _id: -1 }).limit(1)

        if (findOtp.length > 0) {

            const verifyOtp = await bcrypt.compare(input, findOtp[0].otp)


            if (verifyOtp) {
                await user.updateOne({ _id: userID }, { $set: { is_verified: true } }).catch((err) => {
                    console.log(err);
                })

                req.session.user_id = userID
                res.redirect('/home')
            } else {
                req.session.user_id
                res.render('user/signupOtp', { messages: "OTP is incorrect" })
            }
        }
    } catch (error) {
        console.log("error in verifyotp:", error);
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
        let userdata = await user.findOne({ _id: userData })
        let productData = await products.find({ is_blocked: false, is_categoryBlocked: false })

        if (userdata) {

            res.render('user/home', {
                userName: userData.name,
                product: productData,
                userdata
            })
        } else {

            res.render('user/home', {
                userName: null,
                product: productData,
                userdata: ""
            })
        }
    } catch (error) {
        console.log("error in home after login:", error);
    }
}
const home = async (req, res) => {
    try {
        res.render('user/home')
    } catch (error) {
        console.log('error in home:', error);
    }
}

const shop = async (req, res) => {
    try {
        res.render('user/shop')
    } catch (error) {
        console.log('error in shop', error);
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
    home
}