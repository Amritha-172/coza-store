const User = require("../models/userModel")
const category = require('../models/categoryModel')
const product = require('../models/productModel')
const Order = require('../models/orderModel')


const userList = async (req, res) => {
    try {
        const userlist = await User.find({}).sort({ _id: -1 })
        const locals = {
            userlist: userlist
        }



        res.render('userList', locals)

    } catch (error) {
        console.log("error in userlist:", error);

    }
}

const blockUser = async (req, res) => {
    try {
        let id = req.query.id

        const result = await User.updateOne({ _id: id }, { $set: { is_blocked: true } })

        res.redirect('/admin/userlist')
    } catch (error) {
        res.json({ message: "Something went wrong again  try again" })
    }
}

const unblockUser = async (req, res) => {
    try {
        let id = req.query.id
        await User.updateOne({ _id: id }, { $set: { is_blocked: false } })
        res.redirect('/admin/userlist')

    } catch (error) {

    }
}

const categories = async (req, res) => {
    try {
        let categories = await category.find({}).sort({ _id: -1 })
        res.render("categories", { category: categories })
    } catch (error) {
        console.log("error in categoris:", error);
    }
}

const loadAddCategory = async (req, res) => {
    try {
        const messages = req.flash('message')
        let categories = await category.find({}).sort({ _id: -1 })

        res.render("addCategory", { category: categories, messages })
    } catch (error) {
        console.log("error in categoris:", error);
    }
}

const findCategory = async (req, res) => {
    try {
        let catname = req.query.catname
        const catIdregex = new RegExp(`^${catname}$`, i)
        let category = await category.findOne({ catname: catIdregex })
        if (category) {
            res.json({ message: category })
        } else {
            res.json({ message: null })
        }
    } catch (error) {
        res.status(404).res.json({ message: "Something went wrong" })
        console.log("error in findCategory:", error);
    }
}

const findCatId = async (req, res) => {
    try {
        const catId = req.query._id
        let categories = await category.findOne({ _id: catId })
        if (categories) {
            res.json({ message: categories })
        } else {
            res.json({ message: null })
        }
    } catch (error) {
        console.log('error in findcatid:', error);
    }
}

const addCategory = async (req, res) => {
    try {
        const { catName, description } = req.body
        const regexPattern = new RegExp(`^${catName}$`, 'i')
        const alreadyExist = await category.find({ catName: regexPattern })
        if (alreadyExist.length > 0) {
            req.flash('message', "already exist")
            return res.redirect('/admin/addcategory')
        }
        const newCategory = new category({
            catName: catName,
            description: description
        })

        const save = await newCategory.save()
        if (save) {
            res.redirect('/admin/category')
        } else {
            res.json({ message: null })
        }
    } catch (error) {
        console.log("error in addCategory:", error)
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const messages = req.flash('message')
        const id = req.query.id

        let categories = await category.findOne({ _id: id })

        res.render("editCategory", { category: categories, messages })
    } catch (error) {
        console.log("error in categoris:", error);
    }
}

const checkCategory = async (req, res) => {
    try {
        const catName = req.body.name
        const id = req.body.id
        const regexPattern = new RegExp(`^${catName}$`, 'i')
        const alreadyExist = await category.find({ _id: { $ne: id }, catName: regexPattern, })


        if (alreadyExist.length > 0) {
            req.flash('message', "already exist")
            return res.status(200).json({ success: true })
        } else {
            res.json({ success: false })
        }
    } catch (error) {
        console.log('error in check category');
    }
}

const editCategory = async (req, res) => {
    try {
        const { catName, description, id } = req.body

        const editcat = await category.updateOne({ _id: id }, { $set: { catName: catName, description: description } })

        if (editcat) {
            res.redirect('category')
        }



    } catch (error) {
        console.log("error in editcategory:", error);
        res.json({ message: "Something went wrong try again" })
    }
}

const blockCategory = async (req, res) => {
    try {
        const { id } = req.query
        console.log(req.body);
       const productDetails=  await product.updateMany({categoryId:id}, { $set: { is_categoryBlocked: true } })
        console.log('productDetails',productDetails);
        const block = await category.updateOne({ _id:id}, { $set: { is_blocked: true } })
        if (block) {
           res.redirect('/admin/category')
        }else{
            res.redirect('/admin/editcategory')

        }
    } catch (error) {
        console.log("error  in block category:", error);
    }
}

const unblockCategory = async (req, res) => {
    try {
        const { id } = req.query
        console.log(req.body);
       const productDetails=  await product.updateMany({categoryId:id}, { $set: { is_categoryBlocked: false } })
        console.log('productDetails',productDetails);
        const block = await category.updateOne({ _id:id}, { $set: { is_blocked: false } })
        if (block) {
           res.redirect('/admin/category')
        }else{
            res.redirect('/admin/editcategory')

        }
    } catch (error) {
        console.log("error  in block category:", error);
    }
}


const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id

        const deleteCat = await category.deleteOne({ _id: id },)
        if (deleteCat) {
            res.redirect('/admin/category')
        } else {
            res.json({ message: 'something went wrong' })
        }
    } catch (error) {
        console.log('error from deletecategory:', error);
    }
}

const oderDetails = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('userId').populate("deliveryAddress").populate('oderedItem')
        const formattedOrders = orders.map(order => {
            const date = new Date(order.createdAt)
            const formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
            return {
                ...order.toObject(),
                formattedCreatedAt: formattedDate,
            }
        })


        res.render('orderDetails', { orderDetails: formattedOrders })
    } catch (error) {
        console.log("error in oderDetails", error);
    }
}

const singleProduct = async (req, res) => {
    try {
        const orderId = req.query.orderId.replace(/\s+/g,''); 


        const orderDetails = await Order.findOne({ _id: orderId }).populate('userId').populate('oderedItem.productId').populate('deliveryAddress')

        res.render('singleorderDetails', { orderDetails })
    } catch (error) {
        console.log('error in single product', error);
    }
}

const updateSts = async (req, res) => {
    try {
        console.log(req.body);
        const { selectedOrderStatus, orderId, productId } = req.body

        const orderStatus = await Order.updateOne({ _id: orderId }, { $set: { 'oderedItem.$[item].productStatus': selectedOrderStatus } }, { arrayFilters: [{ "item.productId": productId }] })
        console.log('order status', orderStatus);

        res.status(200).json({ success: true })

    } catch (error) {
        res.status(302).json({ success: false })
        console.log('error in update status');
    }
}



module.exports = {
    userList,
    blockUser,
    unblockUser,
    categories,
    addCategory,
    findCatId,
    blockCategory,
    unblockCategory,
    editCategory,
    findCategory,
    loadAddCategory,
    deleteCategory,
    loadEditCategory,
    oderDetails,
    singleProduct,
    updateSts,
    checkCategory,

 

}