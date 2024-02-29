const product = require('../models/productModel')
const category = require('../models/categoryModel')
const fs = require('fs').promises
const path = require('path')
const { find } = require('../models/cartModel')


const loadProduct = async (req, res) => {
    try {
        const products = await product.find({}).populate('categoryId').sort({ _id: -1 })


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
            const images = files.map(file => file.filename);


            const products = new product({
                productName: details.productName,
                price: details.price,
                quantity: details.quantity,
                image: images,
                color: details.color,
                size: details.size,
                categoryId: details.category,
                offer: details.offer,
                description: details.description,

            })
            const save = await products.save()

            if (save) {
                res.status(200).json({ success: true })

            }
        }


    } catch (error) {
        res.status(302).json({ success: false })
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
        const products = await product.findOne({ _id: id }).sort({ _id: -1 })
        const categories = await category.find({})


        res.render('editProducts', { product: products, category: categories, })

    } catch (error) {
        console.log("error in loadeditProdut:", error);
    }
}

const editProduct = async (req, res) => {
    try {


        const { productName, category, price, description, quantity, offer, id, size, color, oldimageUrl } = req.body
        console.log("req.body", req.body);
        console.log(" req.files", req.files);
        const filename = req.files.map(item => {
            return item.filename
        })

        const upload = await product.findOne({ _id: id })
        let array = upload.image
        console.log("upload", upload);

        if (oldimageUrl && oldimageUrl.length) {
            const oldImagesToRemove = JSON.parse(oldimageUrl);
            array = array.filter(item => !oldImagesToRemove.includes(item));

        }
        array.push(...filename)
        console.log("array", array);

        const edit = await product.updateOne({ _id: id }, { $set: { productName: productName, category: category, price: price, description: description, quantity: quantity, offer: offer, size: size, color: color, image: array } })
        console.log('edit', edit);
        if (edit) {

            res.status(200).json({ success: true })

        }
    } catch (error) {
        console.log("error in editproduct:", error);
    }
}

const deleteProduct = async (req, res) => {

    try {
        const { preview, filename, id } = req.body
        const fullpath = path.join(__dirname, "..", "public", preview)

        await fs.unlink(fullpath);


        const result = await product.updateOne({ _id: id }, { $pull: { image: filename } })
        console.log(result);

        res.status(200).json({ success: true })

    } catch (error) {
        console.log("error in delete product");
    }
}

const findbyCategory = async (req, res) => {
    try {
        const { categoryId } = req.query
        const productData = await product.find({ categoryId: categoryId })
        res.render('user/products', { productData })

    } catch (error) {
        console.log();
    }
}


  const highLow= async(req,res)=>{
    try {

        const products=await product.find().sort({price:-1})
        const categories= await category.find()
        res.render('user/shop',{product:products,categories})
        
    } catch (error) {
        console.log('error',error);
    }
  }

  const lowHigh= async(req,res)=>{
    try {
        const products=await product.find().sort({price:1})
        const categories= await category.find()
        res.render('user/shop',{product:products,categories})
        
    } catch (error) {
        console.log('error',error);
    }
  }


  const aToZ = async(req,res)=>{
    try {
        const products = await product.aggregate([
            {
                $addFields: {
                    lowerCaseName: { $toLower: "$productName" } 
                }
            },
            {
                $sort: {
                    lowerCaseName: 1 
                }
            },
            {
                $project: {
                    lowerCaseName: 0 
                }
            }
        ]);
        const categories= await category.find()

        res.render('user/shop',{product:products,categories})
        
    } catch (error) {
        console.log('error in a to z',error);
    }

  }



  const zToa=async(req,res)=>{
    try {
        const products = await product.aggregate([
            {
                $addFields: {
                    lowerCaseName: { $toLower: "$productName" } 
                }
            },
            {
                $sort: {
                    lowerCaseName: -1 
                }
            },
            {
                $project: {
                    lowerCaseName: 0 
                }
            }
        ]);
        const categories= await category.find()

        res.render('user/shop',{product:products,categories})

        
    } catch (error) {
        console.log('error in z to a');
    }
  }


  const catSort=async(req,res)=>{
    try {
        const {id}=req.query

        const products= await product.find({categoryId:id})
        const categories= await category.find()
        
        res.render('user/shop',{product:products,categories})
        
    } catch (error) {
        console.log('error in wome',error);
    }

  }

const Search=async(req,res)=>{
    try {
        const {words}=req.body
        console.log('words',words);
        const products =await product.find({productName:{$regex: words, $options: 'i' }})
        let productData = [];
        if(products.length===0){
            const categories=await category.findOne({catName:{$regex: words, $options: 'i' }})
            if(categories){
                productData =await product.find({categoryId:categories._id})
            }

        }else{
            productData=products
        }

        res.json({productData })
         
        
    } catch (error) {
        console.log('error in search',error);
    }
}





module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    unlistProduct,
    listProduct,
    loadeditProduct,
    editProduct,
    deleteProduct,
    findbyCategory,
    highLow,
    lowHigh,
    aToZ,
    zToa,
    catSort,
    Search

}