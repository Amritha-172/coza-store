const orders = require('../models/orderModel');

const dailySaleReport = async (req, res) => {
    try {
        const orderDetail = await orders.find({});
        const TotalAmount = orderDetail.reduce((acc, curr) => acc + curr.orderAmount, 0);
        let dailyReport = await orders.aggregate([
            { $unwind: "$oderedItem" },
            { $match: { "oderedItem.productStatus": { $nin: ["cancelled", "pending", "returned"] } } },

            {
                $project: {
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    orderAmount: 1,
                    couponDiscount: 1,
                    "oderedItem.offer_id": 1,
                    "oderedItem.quantity": 1
                }
            },
            {
                $group: {
                    _id: {
                        orderId: "$_id",
                        day: "$day",
                        month: "$month",
                        year: "$year"
                    },
                    totalSales: { $first: "$orderAmount" },
                    productsCount: { $sum: "$oderedItem.quantity" },
                    offeredProductsSold: {
                        $sum: {

                            $cond: [{ $ne: ["$oderedItem.offer_id", null] }, 1, 0]
                        }
                    },
                    couponsUsed: { $sum: { $cond: [{ $gt: ["$couponDiscount", 0] }, 1, 0] } }
                }
            },
            {
                $group: {
                    _id: {
                        day: "$_id.day",
                        month: "$_id.month",
                        year: "$_id.year"
                    },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: "$totalSales" },
                    totalProducts: { $sum: "$productsCount" },
                    offeredProductsSold: { $sum: "$offeredProductsSold" },
                    couponsUsed: { $sum: "$couponsUsed" }
                }
            },
            {
                $project: {
                    dateFormatted: {
                        $concat: [
                            { $toString: "$_id.year" }, "-",
                            { $cond: [{ $lt: ["$_id.month", 10] }, { $concat: ["0", { $toString: "$_id.month" }] }, { $toString: "$_id.month" }] }, "-",
                            { $cond: [{ $lt: ["$_id.day", 10] }, { $concat: ["0", { $toString: "$_id.day" }] }, { $toString: "$_id.day" }] }
                        ]
                    },
                    totalSales: 1,
                    totalProducts: 1,
                    offeredProductsSold: 1,
                    couponsUsed: 1,
                    totalOrderCount: 1
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

    

        res.render('salesReport', {
            reportData: dailyReport,
            page: 'daily',
            TotalAmount
        });
    } catch (error) {
        console.log('error in daily sales report', error);
        res.status(500).send('Error generating daily sales report');
    }
};


const weeklySalesReport = async (req, res) => {
    try {

        const sevenWeeksAgo = new Date(new Date().setDate(new Date().getDate() - 49));


        const weeklyReport = await orders.aggregate([
            { $match: { createdAt: { $gte: sevenWeeksAgo } } },
            { $unwind: "$oderedItem" },
            { $match: { "oderedItem.productStatus": { $nin: ["cancelled", "pending", "returned"] } } },
            {
                $addFields: {
                    week: { $isoWeek: "$createdAt" },
                    year: { $isoWeekYear: "$createdAt" },
                    offeredProduct: { $cond: [{ $ne: ["$oderedItem.offer_id", null] }, 1, 0] },
                    couponUsed: { $cond: [{ $gt: ["$couponDiscount", 0] }, 1, 0] }
                }
            },
            {
                $group: {
                    _id: {
                        week: "$week",
                        year: "$year"
                    },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: "$orderAmount" },
                    totalProducts: { $sum: "$oderedItem.quantity" },
                    offeredProductsSold: { $sum: "$offeredProduct" },
                    couponsUsed: { $sum: "$couponUsed" }
                }
            },
            {
                $project: {
                    _id: 0,
                    week: "$_id.week",
                    year: "$_id.year",
                    totalOrderCount: 1,
                    totalSales: 1,
                    totalProducts: 1,
                    offeredProductsSold: 1,
                    couponsUsed: 1,
                    startOfWeek: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week", isoDayOfWeek: 1 } }
                        }
                    },
                    endOfWeek: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week", isoDayOfWeek: 7 } }
                        }
                    }
                }
            },
            { $sort: { "year": 1, "week": 1 } }
        ]);
    
        res.render('salesReport', { reportData: weeklyReport, page: 'weekly', TotalAmount: weeklyReport.reduce((acc, curr) => acc + curr.totalSales, 0) });
    } catch (error) {
        console.log('error in weekly sales report', error);
        res.status(500).send('Error generating weekly sales report');
    }
};



const monthlySalesReport = async (req, res) => {
    try {
   
        const today = new Date();
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, today.getDate());

        const monthlyReport = await orders.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            { $unwind: "$oderedItem" },
            { $match: { "oderedItem.productStatus": { $nin: ["cancelled", "pending", "returned"] } } },
            {
                $addFields: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    offeredProduct: { $cond: [{ $ne: ["$oderedItem.offer_id", null] }, 1, 0] },
                    couponUsed: { $cond: [{ $gt: ["$couponDiscount", 0] }, 1, 0] }
                }
            },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: "$orderAmount" },
                    totalProducts: { $sum: "$oderedItem.quantity" },
                    offeredProductsSold: { $sum: "$offeredProduct" },
                    couponsUsed: { $sum: "$couponUsed" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    totalOrderCount: 1,
                    totalSales: 1,
                    totalProducts: 1,
                    offeredProductsSold: 1,
                    couponsUsed: 1,
                    monthName: { $arrayElemAt: [["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], { $subtract: ["$month", 1] }] },
                    monthYear: { $concat: [{ $arrayElemAt: [["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], { $subtract: ["$month", 1] }] }, "-", { $toString: "$year" }] }
                }
            },
            { $sort: { "year": 1, "month": 1 } }
        ]);


        const totalAmountResult = await orders.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$orderAmount" }
                }
            }
        ]);
        const TotalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
        console.log("monthlyReport", monthlyReport);
        res.render('salesReport', {
            reportData: monthlyReport,
            page: 'monthly',
            TotalAmount: TotalAmount
        });
    } catch (error) {
        console.log('error in monthly sales report', error);
        res.status(500).send('Error generating monthly sales report');
    }
};



const YearlySalesReport = async (req, res) => {
    try {

        const totalAmountResult = await orders.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$orderAmount" }
                }
            }
        ]);
        const TotalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;


        const yearlyReport = await orders.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$createdAt" } },
                    orderedProductCount: { $sum: 1 },
                    totalAmount: { $sum: "$orderAmount" }
                }
            },
            {
                $sort: { '_id.year': 1 }
            }
        ]);



        res.render('salesReport', {
            report: yearlyReport,
            page: 'yearly',
            TotalAmount: TotalAmount
        });


    } catch (error) {
        console.log('error in yearly sales report', error);
        res.status(500).send('Error generating yearly sales report');
    }
};




module.exports = {
    dailySaleReport,
    weeklySalesReport,
    monthlySalesReport,
    YearlySalesReport

}