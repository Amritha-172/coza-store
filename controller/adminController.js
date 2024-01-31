const User = require("../models/userModel")
const category = require('../models/categoryModel')
const product = require('../models/productModel')

const userList = async (req, res) => {
    try {
        const userlist = await User.find({ is_verified: true }).sort({ _id: -1 })
        const locals = {
            userlist: userlist
        }
        // console.log(Array.isArray(userlist));

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
const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id

        let categories = await category.find({ _id: id })

        res.render("editCategory", { category: categories })
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

const blockCategory = async (req, res) => {
    try {
        const { catName } = req.body
        await product.updateOne({ category: catName }, { $set: { is_categoryBlocked: true } })
        const block = await category.findAndUpdate({ catName: catName }, { $set: { is_blocked: true } })
        if (block) {
            res.json({ messagea: "Block category is successfull" })
        }
    } catch (error) {
        console.log("error  in block category:", error);
    }
}

const unblockCategory = async (req, res) => {
    try {
        const { catName } = req.body
        await product.updateOne({ catName: catName }, { $set: { is_categoryBlocked: false } })
        const unBlock = await category.findByIdAndUpdate({ category: catName }, { $set: { is_blocked: false } })
        if (unBlock) {
            res.json({ message: "Unblock successfully" })
        } else {
            res.json({ message: "Something Error" })
        }

    } catch (error) {
        console.log("Error in unblocked category");
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

const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id
        console.log('find category:', id);
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
    loadEditCategory

}