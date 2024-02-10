const product = require('../models/productModel')
const category = require('../models/categoryModel')
const { categories } = require('./adminController')

const loadProduct = async (req, res) => {
    try {
        const products = await product.find({})

        res.render("products", { products })
    } catch (error) {
        console.log('error in load product:', error);
    }
}
const loadAddProduct = async (req, res) => {
    try {
        const messages = req.flash('message')
        const categories = await category.find({})
        res.render("addProduct", { categories, messages })
    } catch (error) {
        console.log('error in load addproduct');
    }
}

const addProduct = async (req, res) => {
    try {
        const details = req.body
        const files = req.files
        const alreadyExist = await product.findOne({ productName: req.body.productName })
        if (alreadyExist) {
            req.flash('message', "Product already existed")
            return res.redirect('addproduct')
        }
        else {
            const images = [
                files[0].filename,
                files[1].filename,
                files[2].filename,

            ]
            const products = new product({
                productName: details.productName,
                price: details.price,
                quantity: details.quantity,
                image: images,
                color: details.color,
                size: details.size,
                category: details.category,
                offer: details.offer,
                description: details.description,



            })
            const save = await products.save()
            if (save) {
                res.redirect('/admin/productlist')
            }
        }


    } catch (error) {
        console.log("error in addproduct:", error);
    }
}
const listProduct = async (req, res) => {
    try {
        const { productName } = req.query

        const update = await product.updateOne({ productName: productName }, { $set: { is_blocked: true } })

        if (update) {

            res.redirect('productlist')
        } else {
            res.json({ message: "something went wrong try again" })
        }

    } catch (error) {
        console.log("error in list product", error);
    }
}

const unlistProduct = async (req, res) => {
    try {
        const { productName } = req.query
        const update = await product.updateOne({ productName: productName }, { $set: { is_blocked: false } })

        if (update) {
            res.redirect('productlist')
        } else {
            res.json({ message: 'Something went wrong' })
        }
    } catch (error) {
        console.log("error in unlisted product");
    }
}

const loadeditProduct = async (req, res) => {
    try {

        const { id } = req.query
        const products = await product.findOne({ _id: id })
        const categories = await category.find({})
        console.log(products);
        res.render('editProducts', { product: products })

    } catch (error) {
        console.log("error in loadeditProdut:", error);
    }
}

const editProduct = async (req, res) => {
    try {
       

        const { productName, category, price, description, quantity, offer, id, size, color, oldimageUrl } = req.body
         const filename = req.files.map(item => {
            return item.filename
        })
        const upload = await product.findOne({ _id: id })
        let array = upload.image
       
        array = array.filter(item => !oldimageUrl.includes(item))
        console.log(array);
        array.push(...filename)
     
        const edit = await product.updateOne({ _id: id }, { $set: { productName: productName, category: category, price: price, description: description, quantity: quantity, offer: offer, size: size, color: color, image: array } })
        console.log(edit);
        if (edit.modifiedCount===1) {
              console.log(edit.modifiedCount===1);
              res.status(200).json({success:true})
         
        }
    } catch (error) {
        console.log("error in editproduct:", error);
    }
}


module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    unlistProduct,
    listProduct,
    loadeditProduct,
    editProduct
}