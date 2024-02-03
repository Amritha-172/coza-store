const user=require('../models/userModel')
const Cart=require('../models/cartModel')
const Product=require('../models/productModel')
const {ObjectId}=require('mongodb')

const addToCart = async (req, res) => {
    try {
      
      let { productId, quantity } = req.body;
         console.log(productId);
         quantity=Number(quantity)
      const userId = req.session.user_id; 
   

      // Find the product to get its price
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      // Calculate the price based on the quantity
      const price = product.price * quantity;
  
      // Check if the cart item already exists for this user and product
      let cartItem = await Cart.findOne({ userId: userId, productId: productId });
  
      if (cartItem) {
        // If the cart item exists, update its quantity and price
        cartItem.quantity += quantity;
        cartItem.price += price;
      } else {
        // If the cart item does not exist, create a new cart item
        
        cartItem = new Cart({
          userId: userId,
          productId: productId,
          quantity: quantity,
          price: price
        });
      }
  
      // Save the cart item
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
      const id=new ObjectId(req.params.id)
        console.log('productId:',id);
        
        const exist =await Cart.findOne({productId:id})
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
    const {productId}=req.query
    const userId = new ObjectId( req.session.user_id)
    const product=await Product.findById({_id:productId})
    const Usercart=await Cart.findOne({userId:userId})

      res.render('shoppingCart',{product,Usercart})
  } catch (error) {
      console.log('error in shopping cart:', error);
  }
}


const checkout=async(req,res)=>{
  try {

  

      res.render('checkOut')
  } catch (error) {
      console.log("error in checkout page",error);
  }
}


module.exports={
    addToCart,
    itemExist,
    shoppingcart,
    checkout
}