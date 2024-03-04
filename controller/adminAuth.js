 const User=require('../models/userModel')
 const Category=require('../models/categoryModel')
 const orders= require('../models/orderModel')


require('dotenv').config()

const adminLogin = async (req, res) => {
    try {
        res.render("adminLogin", { message: "enter name and password" })
    } catch (error) {
        console.log(error, "error on admin login");
    }
}

const adminVerify = async (req, res) => {
    try {
        const { name, password } = req.body

        if (name == process.env.ADMIN_NAME && password == process.env.ADMIN_PASS) {
            req.session.admin_id = "admin1"
            res.redirect("/admin/dashboard")
        } else {
            res.render("adminlogin", { message: "incorrect username and password" })
            console.log("error");
        }

    } catch (error) {
        console.log("error in the admin login verify", error);
    }
}

const dashboard = async (req, res) => {
    try {
        const userData = await User.find({});
        const categoryData = await Category.find({});
        const orderData = await orders.find({});
        const TotalAmount = orderData.reduce((acc, curr) => acc + curr.orderAmount, 0);

        // Aggregate orders to get monthly totals and counts
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const monthlyOrderData = await orders.aggregate([
            { $match: { createdAt: { $gte: startOfYear } } },
            { $group: {
                _id: { 
                    month: { $month: "$createdAt" }, 
                    year: { $year: "$createdAt" }
                },
                monthlyTotal: { $sum: "$orderAmount" },
                orderCount: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Initialize arrays for the chart
        let monthlyOrderCounts = new Array(12).fill(0);
        let monthlyTotalAmounts = new Array(12).fill(0);

        // Populate the arrays with data from the aggregation
        monthlyOrderData.forEach(data => {
            const monthIndex = data._id.month - 1; // -1 because array is zero-indexed
            monthlyOrderCounts[monthIndex] = data.orderCount;
            monthlyTotalAmounts[monthIndex] = data.monthlyTotal;
        });
        console.log("orderData",orderData,'monthlyOrderCounts',monthlyOrderCounts,'monthlyTotalAmounts',monthlyTotalAmounts);

        res.render("dashboard", {
            userData,
            categoryData,
            TotalAmount,
            orderData,
            monthlyOrderCounts,
            monthlyTotalAmounts
        });
    } catch (error) {
        console.log("error on dashboard", error);
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.admin_id = null;
        res.redirect('/admin')
    } catch (error) {
        console.log("error on adminlogout", error);
    }
}

module.exports = {
    dashboard,
    adminVerify,
    adminLogin,
    adminLogout
}