const user=require('../models/userModel')
const Cart=require('../models/cartModel')
const Product=require('../models/productModel')
const {ObjectId}=require('mongodb')
const Address=require('../models/addressModal')

const addToCart = async (req, res) => {
    try {
      
      let { productId, quantity } = req.body;
       
         quantity=Number(quantity)
      const userId = req.session.user_id; 
   

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      const price = product.price * quantity;
  
      
      let cartItem = await Cart.findOne({ userId: userId, productId: productId });
  
      if (cartItem) {
        
        cartItem.quantity += quantity;
        cartItem.price += price;
      } else {
       
        
        cartItem = new Cart({
          userId: userId,
          productId: productId,
          quantity: quantity,
          price: price
        });
      }
  
      
      const savedCartItem = await cartItem.save();
        console.log("add to cart success");
  
      res.status(200).json(savedCartItem);
    } catch (error) {
      console.log("Error in addToCart:", error);
      res.status(500).json("An error occurred");
    }
  };

const itemExist=async(req,res)=>{
    try {
      const userId=req.session.user_id
      const id=new ObjectId(req.params.id)
        console.log('productId:',id);
        
        const exist =await Cart.findOne({productId:id,userId:userId})
             console.log('exist:',exist);
        if(exist){
            res.status(200).json({exist:true})
        }
        
        
    } catch (error) {
        console.log("error in item exist:",error);
    }
}

const shoppingcart = async (req, res) => {
  try {
    const userId = req.session.user_id; 
    let Usercart = await Cart.find({ userId: userId });

    // Fetch product details for each cart item
    const cartItemsWithProductDetails = await Promise.all(
      Usercart.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        return {
          ...cartItem._doc,
          productDetails: product,
        };
      })
    );
   
    res.render('user/shoppingCart', { cartItems: cartItemsWithProductDetails });
  } catch (error) {
    console.log('error in shopping cart:', error);
    // res.status(500).send('Error retrieving shopping cart');
    res.render('error')
  }
}


const checkout=async(req,res)=>{
  try {
     const {totalpice}=req.body
   
     console.log("total price",totalpice);
    const userId=req.session.user_id
    const addressData=await Address.find({userId:userId})
    const total= await Cart.find({userId:userId})
    let newTotal=0
    total.forEach(element => {
      newTotal=element.price+newTotal
    });
    console.log(addressData);
       
      res.render('user/checkOut',{addressData,newTotal})
  } catch (error) {
      console.log("error in checkout page",error);
  }
}

const editPrice=async(req,res)=>{
  try {
    const userId=req.session.user_id
    const {productId,totalPrice,quantity}=req.body

    await Cart.updateOne({productId:productId},{$set:{price:totalPrice,quantity:quantity}})
   
      const total= await Cart.find({userId:userId})

      let newTotal=0
      total.forEach(element => {
        newTotal=element.price+newTotal
      });
      
 res.status(200).json({success:true,newTotal})
  } catch (error) {
    console.log('error in edit price');
    res.status(300).json('error')
  }
}

const removeProduct=async(req,res)=>{
  try {
    const {productId}=req.body
       const remove=await Cart.deleteOne({productId:productId}) 
      
       if(remove){
        res.status(200).json({success:true})
       }
      } catch (error) {
     console.log('error in remove product',error);
  }
}

const checkStock=async(req,res)=>{
  try {
    const{productId,quantity}=req.body
    console.log(productId);
    const product= await Product.findOne({_id:productId})
    if(product && product.quantity >= quantity){
       res.json({success:false})
    }else{
      res.json({success:true})
    }
    
  } catch (error) {
    console.log('error in checkstock');
  }
}

module.exports={
    addToCart,
    itemExist,
    shoppingcart,
    checkout,
    editPrice,
    removeProduct,
    checkStock
}