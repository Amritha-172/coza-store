const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const product = require('../models/productModel')



const loadshop = async (req, res) => {
    try {
        const productArray = await product.find({ is_categoryBlocked: false, is_blocked: false })
        res.render("user/shop", { productArray })
    } catch (error) {
        console.log("error in loadshop:", error);
        res.render('error')
    }
}
const profile = async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.session.user_id })
        let address = null
        if (userData) {
            res.render('user/profile', { userData: userData, Address: address })
        }else{
            res.render('error')
        }
    } catch (error) {
        console.log("Error in profile:", error)
    }
}

const singleProduct = async (req, res,) => {
    try {
      
        const productId = req.query.productId
    
        console.log(productId, typeof (productId))

        const productData = await product.findOne({ _id: productId })

        const userData = await User.findOne({ email: req.session.user_email })
     
        if (productData) {
            res.render('user/singleProduct', { product: productData ,userData})
        }else{
            res.render('error')
        }
    } catch (error) {
        console.log("error in Single product:", error);
        res.render('error')
    }
}



module.exports = {
    singleProduct,
    loadshop,
    profile,
    
}


