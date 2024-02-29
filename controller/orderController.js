const address = require('../models/addressModal');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

const product = require('../models/productModel')
const payment = require('../models/paymentModel')
const wallet = require('../models/walletModel');



const useraddAddress = async (req, res) => {
    try {

        const userId = req.session.user_id;
        console.log(req.body);
        const { addressType, alternativePhone, landmark, mobile, state, city, streetAddress, locality, pincode, name } = req.body
         if(!addressType||addressType.trim()==""){
            req.flash('message','Please Select Address type')
          return res.redirect('/addAddress')

         }
         if(!mobile||mobile.length !==10){
            req.flash('message','Please Enter Mobile Number')
            return res.redirect('/addAddress')
         }
         if(!state||state.trim()==''){
            req.flash('message','Please select state')
            return res.redirect('/addAddress')
         }
         if(!city||city.trim()==""){
            req.flash('message','Please select city')
            return res.redirect('/addAddress')
         }
         if(!streetAddress||streetAddress.trim()==""){

            req.flash('message','Please select streetAddress')
            return res.redirect('/addAddress')
         }
          if(!locality||locality.trim()==""){
            req.flash('message','Please select locallity')
            return res.redirect('/addAddress')
          }
           if(!pincode||pincode.length !==6){
            req.flash('message','Please select pincode')
            return res.redirect('/addAddress')
           }
      


        const newAddress = new address({
            userId: userId,
            name: name,
            mobile: mobile,
            pincode: pincode,
            addressType: addressType,
            streetAddress: streetAddress,
            city: city,
            landmark: landmark,
            alterPhone: alternativePhone,
            locality: locality,
            state: state

        })
        const save = await newAddress.save()
        console.log(save);
        if (save) {
            res.redirect('/userAddress')

        } else {
            res.status(400).json({ success: false })
        }

    } catch (error) {
        console.log('error in add address', error);
    }
}

const addAddress = async (req, res) => {
    try {

        const userId = req.session.user_id;
        console.log("req.body",req.body);
        const { addressType, alternativePhone, landmark, mobile, state, city, streetAddress, locality, pincode, name } = req.body

           if(!name||name.trim()==""){  
              return res.json({success:false,message:"user Name is required"})
           }

           if(mobile.length!==10){
           
            return res.json({success:false,message:"Please Enter Valid Number"})
           }

           if(pincode.length!==6){
           
            return res.json({success:false,message:"Please Enter Valid Pincode"})
           }
           if(!city||city.trim()==""){
            return res.json({success:false,message:"Please Enter  city name"})
           }
            if(!streetAddress||streetAddress.trim()==""){
                 return res.json({success:false,message:"Please Enter  Street Address"})
            }
             if(!locality||locality.trim()==""){
                return res.json({success:false,message:"Please Enter  locality"})
             }
             if(!addressType||addressType.trim()==""){
                return res.json({success:false,message:"Please Select Address type  "})
             }





        const newAddress = new address({
            userId: userId,
            name: name,
            mobile: mobile,
            pincode: pincode,
            addressType: addressType,
            streetAddress: streetAddress,
            city: city,
            landmark: landmark,
            alterPhone: alternativePhone,
            locality: locality,
            state: state

        })
        const save = await newAddress.save()
        console.log(save);
        if (save) {
           res.status(200).json({success:true,message:''})

        } 
    } catch (error) {
        console.log('error in add address', error);
    }
}

const checkname = async (req, res) => {
    try {
        const { name } = req.body
        console.log(name);
        if (!name || name.trim() == '') {
            res.json({ success: false })
        } else {
            res.json({ success: true })
        }
    } catch (error) {
        console.log('error in check name');
    }
}


const placeorder = async (req, res) => {
    try {
        const { transactionId } = req.query
        console.log("razorpay", transactionId);
        const { Amount, selectedAddress, selectedPaymentMethod } = req.body
        console.log('selectedAddress', selectedAddress);
        if (!selectedAddress) {

            res.json({ success: false, message: "Please select an Address" })
        }

        const userId = req.session.user_id
        const cartItems = await Cart.find({ userId: userId })
        console.log("cart items", cartItems);
        const orderedItem = await cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))

        for (let item of orderedItem) {
            const { productId, quantity } = item

            const products = await product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });

        }


        const order = new Order({
            userId: userId,
            cartId: cartItems.map(item => item._id),
            oderedItem: orderedItem,
            orderAmount: Amount,
            deliveryAddress: selectedAddress,
            paymentMethod: selectedPaymentMethod,
            orderStatus: 'pending'
        })
        const save = await order.save()

        await Cart.deleteMany({ userId: userId })

        if (selectedPaymentMethod == "COD") {
            const Payment = new payment({
                userId: userId,
                orderId: order._id,
                amount: Amount,
                status: 'pending',
                paymentMethod: selectedPaymentMethod

            })
            await Payment.save()
        } else {
            const Payment = new payment({
                userId: userId,
                orderId: order._id,
                amount: Amount,
                status: 'completed',
                paymentMethod: selectedPaymentMethod,
                transactionId: transactionId

            })
            await Payment.save()

        }
        if (save) {
            console.log("orderId", order._id);
            res.status(200).json({ success: true, orderId: order._id })

        }
        else {
            res.status(302).json({ success: false })
        }





    } catch (error) {
        console.log('error in place order page', error);
    }
}

const ordersuccess = async (req, res) => {
    try {

        const { orderId } = req.query
        const orderDetail = await Order.findOne({ _id: orderId }).populate('userId').populate('deliveryAddress')
        console.log("order details", orderDetail);
        const formattedCreatedAt = orderDetail.createdAt.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        console.log(orderDetail.deliveryAddress);


        console.log(formattedCreatedAt);

        res.render('user/orderSuccess', { orderDetail, formattedCreatedAt })
    } catch (error) {
        console.log('error in order details page');
    }
}

const orderpage = async (req, res) => {
    try {
        const userId = req.session.user_id
        const orderDetails = await Order.find({ userId: userId }).populate('oderedItem.productId').sort({ _id: -1 })

        res.render('user/user/orderpage', { orderDetails })


    } catch (error) {
        console.log('error in orderpage', error);
    }
}

const singleorder = async (req, res) => {
    try {
        const orderId = req.query.orderId.trim();
        const productId = req.query.productId

        const orderDetails = await Order.findOne({ _id: orderId }).populate('deliveryAddress').populate('oderedItem.productId')


        const products = orderDetails.oderedItem


        const matchedItem = await products.find(item => item.productId._id.toString() === productId)

        res.render('user/user/singleOrder', { orderDetails, productDetails: matchedItem })

    } catch (error) {
        console.log("error in singleorder", error);
    }
}


const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user_id

        const { orderId, productId, paymentMethod } = req.body

        console.log(orderId, productId);

        const productStatus = await Order.updateOne({ _id: orderId }, { $set: { 'oderedItem.$[item].productStatus': "cancelled" } }, { arrayFilters: [{ "item._id": productId }] })

        const order = await Order.findOne({ _id: orderId }).populate("oderedItem.productId")
        const matchedItem = await order.oderedItem.filter(item => item._id = productId)



        const qnty = matchedItem[0].quantity
        console.log('qnty', qnty);
        const amount = matchedItem[0].productId.price
        console.log('amount', amount);

        const productid = matchedItem[0].productId._id
        console.log("productid", productid);

        const totalAmount = qnty * amount

        const isExistWallet = await wallet.findOne({ userId: userId })

        if (paymentMethod !== "COD") {


            if (!isExistWallet) {

                const newWallet = new wallet({
                    userId: userId,
                    balance: totalAmount,
                    tratransaction: [{
                        amount: totalAmount,
                        transactionsMethod: "Refund",
                    }]

                })

                await newWallet.save()
            } else {

                await wallet.updateOne({ userId: userId }, { $inc: { balance: totalAmount }, $push: { transaction: { amount: totalAmount, transactionsMethod: "Refund" } } })

            }
        }

        if (productStatus) {

            await product.updateOne({ _id: productid }, { $inc: { quantity: qnty } })
            res.status(200).json({ success: true, })

        } else {
            res.status(302).json({ success: false })
        }






    } catch (error) {
        console.log('error in cancel order', error);
    }
}


const placeorderWallet = async (req, res) => {
    try {
        const { Amount, selectedAddress, selectedPaymentMethod } = req.body
        const userId = req.session.user_id
        const cartItems = await Cart.find({ userId: userId })

        const orderedItem = await cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
        const walletDetails = await wallet.findOne({ userId: userId })
        if (walletDetails.balance < Amount) {
            return res.json({ message: "please check your wallet" })
        }
        const walletFund = await wallet.updateOne({ userId: userId }, { $inc: { balance: -Amount }, $push: { transaction: { amount: Amount, transactionsMethod: "Credit" } } })
        console.log('walletFund', walletFund);



        for (let item of orderedItem) {
            const { productId, quantity } = item

            const products = await product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });

        }
        const order = new Order({
            userId: userId,
            cartId: cartItems.map(item => item._id),
            oderedItem: orderedItem,
            orderAmount: Amount,
            deliveryAddress: selectedAddress,
            paymentMethod: selectedPaymentMethod,
            orderStatus: 'pending'
        })
        const save = await order.save()

        await Cart.deleteMany({ userId: userId })
        const Payment = new payment({
            userId: userId,
            orderId: order._id,
            amount: Amount,
            status: 'pending',
            paymentMethod: selectedPaymentMethod

        })
        await Payment.save()

        res.status(200).json({ success: true, orderId: order._id })


    } catch (error) {

        console.log('error in place order wallet', error);
        res.status(302).json({ success: false })

    }
}

const retrunOrder = async (req, res) => {
    try {
        console.log(req.body);
        const userId=req.session.user_id
        const { selectedReason, productId, orderId } = req.body

        if(!selectedReason){
            res.json({success:false})

        }

        const orderDetails = await Order.updateOne({ _id: orderId }, { $set: { 'oderedItem.$[item].returReason': selectedReason } }, { arrayFilters: [{ "item._id": productId }] })


        const order = await Order.findOne({ _id: orderId }).populate("oderedItem.productId")
        const matchedItem = await order.oderedItem.filter(item => item._id = productId)

        const qnty = matchedItem[0].quantity
        console.log('qnty', qnty);
        const amount = matchedItem[0].productId.price
        console.log('amount', amount);

        const productid = matchedItem[0].productId._id
        console.log("productid", productid);

        const totalAmount = qnty * amount

        const isExistWallet = await wallet.findOne({ userId: userId })

       
            if (!isExistWallet) {

                const newWallet = new wallet({
                    userId: userId,
                    balance: totalAmount,
                    tratransaction: [{
                        amount: totalAmount,
                        transactionsMethod: "Refund",
                    }]

                })

                await newWallet.save()
            } else {

                await wallet.updateOne({ userId: userId }, { $inc: { balance: totalAmount }, $push: { transaction: { amount: totalAmount, transactionsMethod: "Refund" } } })

            }
        

            res.status(200).json({success:true})


    } catch (error) {
        console.log('error in return',error);
    }
}



module.exports = {
    addAddress,
    checkname,
    ordersuccess,
    placeorder,
    orderpage,
    singleorder,
    useraddAddress,
    cancelOrder,
    placeorderWallet,
    retrunOrder
}



