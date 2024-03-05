const product = require('../models/productModel')
const category = require('../models/categoryModel')
const fs = require('fs').promises
const path = require('path')
const user = require('../models/userModel')
const offers = require('../models/offerModel')


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
        console.log("req.body",req.body);
        console.log("req.files",req.files);
        const details = req.body

        const files = req.files
     if(files.length<2){
      return res.json({success:false,message:'Please select 2 images'})
     }

        const alreadyExist = await product.findOne({ productName: req.body.productName })

        if (alreadyExist) {
           
            return res.json({success:false,message:'Item already existed'})
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


        const { productName, category, price, description, quantity, id, size, color, oldimageUrl } = req.body
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

        const edit = await product.updateOne({ _id: id }, { $set: { productName: productName, categoryId: category, price: price, description: description, quantity: quantity, size: size, color: color, image: array } })
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
        const { categoryId } = req.query;
        
     
        const offerData = await offers.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        let productData = await product.find({ categoryId: categoryId, is_blocked: false, is_categoryBlocked: false }).populate('categoryId');

       
        productData = productData.map(product => {
            let productDiscountedPrice = product.price;
            let categoryDiscountedPrice = product.price;
            let appliedOffer = null;

            offerData.forEach(offer => {
                if (offer.offerType === 'product' && offer.productId.includes(product._id.toString())) {
                    productDiscountedPrice = product.price - (product.price * offer.discount / 100);
                }
            });

          
            offerData.forEach(offer => {
                if (offer.offerType === 'category' && offer.categoryId.includes(product.categoryId._id.toString())) {
                    categoryDiscountedPrice = product.price - (product.price * offer.discount / 100);
                }
            });

            if (productDiscountedPrice <= categoryDiscountedPrice) {
                appliedOffer = offerData.find(offer => offer.offerType === 'product' && offer.productId.includes(product._id.toString()));
                discountedPrice = Math.round(productDiscountedPrice);
            } else {
                appliedOffer = offerData.find(offer => offer.offerType === 'category' && offer.categoryId.includes(product.categoryId._id.toString()));
                discountedPrice = Math.round(categoryDiscountedPrice);
            }

           
            return {
                ...product.toObject(),
                originalPrice: product.price,
                discountedPrice,
                appliedOffer: appliedOffer ? {
                    offerName: appliedOffer.offerName,
                    discount: appliedOffer.discount
                } : null,
                offerText: appliedOffer ? `${appliedOffer.discount}% Off` : ''
            };
        });
     console.log("productData",productData);
     
        res.render('user/products', { productData });
    } catch (error) {
        console.log('Error finding products by category:', error);
        res.status(500).send('Error finding products by category');
    }
};



const highLow = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userdata = await user.findOne({ _id: userId });
  
        let products = await product.find().sort({ price: -1 }).populate('categoryId');
        const categories = await category.find();

        let offerData = await offers.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        const applyOffer = (product) => {
            let discountedPrice = product.price;
            let appliedOffer = null;

            offerData.forEach(offer => {
                const productMatchesOffer = offer.offerType === 'product' && offer.productId.some(id => id.toString() === product._id.toString());
                const categoryMatchesOffer = offer.offerType === 'category' && product.categoryId && offer.categoryId.some(id => id.toString() === product.categoryId._id.toString());

                if (productMatchesOffer || categoryMatchesOffer) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });

            return { discountedPrice, appliedOffer };
        };

        products = products.map(product => {
            const { discountedPrice, appliedOffer } = applyOffer(product);
            return {
                ...product._doc, 
                originalPrice: product.price,
                discountedPrice,
                appliedOffer: appliedOffer ? {
                    offerName: appliedOffer.offerName,
                    discount: appliedOffer.discount
                } : null,
                offerText: appliedOffer ? `${appliedOffer.discount}% Off` : ''
            };
        });

        products.sort((a, b) => b.discountedPrice - a.discountedPrice);

        res.render('user/shop', { product: products, categories, userdata });
    } catch (error) {
        console.log('error', error);
    }
};



const lowHigh = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userdata = await user.findOne({ _id: userId });
  
        let products = await product.find().sort({ price: 1 }).populate('categoryId');
        const categories = await category.find();

        let offerData = await offers.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        const applyOffer = (product) => {
            let discountedPrice = product.price;
            let appliedOffer = null;

            offerData.forEach(offer => {
                const productMatchesOffer = offer.offerType === 'product' && offer.productId.some(id => id.toString() === product._id.toString());
                const categoryMatchesOffer = offer.offerType === 'category' && product.categoryId && offer.categoryId.some(id => id.toString() === product.categoryId._id.toString());

                if (productMatchesOffer || categoryMatchesOffer) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });

            return { discountedPrice, appliedOffer };
        };

        products = products.map(product => {
            const { discountedPrice, appliedOffer } = applyOffer(product);
            return {
                ...product._doc, 
                originalPrice: product.price,
                discountedPrice,
                appliedOffer: appliedOffer ? {
                    offerName: appliedOffer.offerName,
                    discount: appliedOffer.discount
                } : null,
                offerText: appliedOffer ? `${appliedOffer.discount}% Off` : ''
            };
        });

        products.sort((a, b) => a.discountedPrice -b.discountedPrice );

        res.render('user/shop', { product: products, categories, userdata });
    } catch (error) {
        console.log('error', error);
    }
};



const aToZ = async (req, res) => {
    try {
        const userId = req.session.user_id
        const userdata = await user.findOne({ _id: userId })

   let products = await product.aggregate([
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
        const categories = await category.find()


        let offerData = await offers.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        products = await product.populate(products, { path: 'categoryId' }); 
        products = products.map(product => {
            let discountedPrice = product.price;
            let appliedOffer = null;


            offerData.forEach(offer => {
                if (offer.offerType === 'product' && offer.productId.some(id => id.toString() === product._id.toString())) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });


            offerData.forEach(offer => {
                if (offer.offerType === 'category' && offer.categoryId.some(id => id.toString() === product.categoryId._id.toString())) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });

            return {
                ...product,
                originalPrice: product.price,
                discountedPrice,
                appliedOffer: appliedOffer ? {
                    offerName: appliedOffer.offerName,
                    discount: appliedOffer.discount
                } : null,
                offerText: appliedOffer ? `${appliedOffer.discount}% Off` : ''
            };
        });

        res.render('user/shop', { product: products, categories, userdata })

    } catch (error) {
        console.log('error in a to z', error);
    }

}



const zToa = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const userdata = await user.findOne({ _id: userId });

        let products = await product.aggregate([
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

    
        const categories = await category.find();
        let offerData = await offers.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

       
        products = await product.populate(products, { path: 'categoryId' }); 
        products = products.map(product => {
            let discountedPrice = product.price;
            let appliedOffer = null;


            offerData.forEach(offer => {
                if (offer.offerType === 'product' && offer.productId.some(id => id.toString() === product._id.toString())) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });


            offerData.forEach(offer => {
                if (offer.offerType === 'category' && offer.categoryId.some(id => id.toString() === product.categoryId._id.toString())) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });

            return {
                ...product,
                originalPrice: product.price,
                discountedPrice,
                appliedOffer: appliedOffer ? {
                    offerName: appliedOffer.offerName,
                    discount: appliedOffer.discount
                } : null,
                offerText: appliedOffer ? `${appliedOffer.discount}% Off` : ''
            };
        });

        res.render('user/shop', { product: products, categories, userdata });
    } catch (error) {
        console.log('error in z to a', error);
    }
};



const catSort = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { id } = req.query;
        const userdata = await user.findOne({ _id: userId });


        let products = await product.find({ categoryId: id });


        const categories = await category.find();


        let offerData = await offers.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });


        products = products.map(product => {
            let discountedPrice = product.price;
            let appliedOffer = null;


            offerData.forEach(offer => {
                if (offer.offerType === 'product' && offer.productId.includes(product._id.toString())) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;
                    }
                }
            });


            offerData.forEach(offer => {
                if (offer.offerType === 'category' && offer.categoryId.includes(id)) {
                    let newDiscountedPrice = product.price - (product.price * offer.discount / 100);
                    if (newDiscountedPrice < discountedPrice) {
                        discountedPrice = Math.round(newDiscountedPrice);
                        appliedOffer = offer;

                    }
                }
            });

            return {
                ...product.toObject(),
                originalPrice: product.price,
                discountedPrice,
                appliedOffer: appliedOffer ? {
                    offerName: appliedOffer.offerName,
                    discount: appliedOffer.discount
                } : null,
                offerText: appliedOffer ? `${appliedOffer.discount}% Off` : ''
            };
        });

        res.render('user/shop', { product: products, categories, userdata });

    } catch (error) {
        console.log('error in catSort', error);
    }
};


const Search = async (req, res) => {
    try {
        const { words } = req.body
        console.log('words', words);
        const products = await product.find({ productName: { $regex: words, $options: 'i' } })
        let productData = [];
        if (products.length === 0) {
            const categories = await category.findOne({ catName: { $regex: words, $options: 'i' } })
            if (categories) {
                productData = await product.find({ categoryId: categories._id })
            }

        } else {
            productData = products
        }

        res.json({ productData })


    } catch (error) {
        console.log('error in search', error);
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