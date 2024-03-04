const orders = require('../models/orderModel');

const dailySaleReport = async (req, res) => {
    try {
        // Define the start and end of the current day
        const orderDetail = await orders.find({})
        const TotalAmount = orderDetail.reduce((acc, curr) => {
            return acc + curr.orderAmount
        }, 0)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Aggregate to calculate the total amount and order count for the current day
        const dailyReport = await orders.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null, // Grouping without a specific field since we want the total for the day
                    totalAmount: { $sum: "$orderAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    totalAmount: 1,
                    orderCount: 1,
                    dateOfReport: { $dateToString: { format: "%Y-%m-%d", date: new Date() } } // Adding the report date
                }
            }
        ]);

        // Ensure reportData is always an array
        const reportData = dailyReport.map(item => ({
            totalAmount: item.totalAmount,
            orderCount: item.orderCount,
            dateOfReport: item.dateOfReport
        }));

        // If no orders were found for the day, add a default entry
        if (!reportData.length) {
            reportData.push({
                totalAmount: 0,
                orderCount: 0,
                dateOfReport: new Date().toISOString().substring(0, 10)
            });
        }
console.log("reportData",reportData);
        res.render('salesReport', {
            reportData, // Now reportData is guaranteed to be an array
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
        const orderDetail = await orders.find({})
        const TotalAmount = orderDetail.reduce((acc, curr) => {
            return acc + curr.orderAmount
        }, 0)

        const sevenWeeksAgo = new Date(new Date().setDate(new Date().getDate() - 49));

        const weeklyReport = await orders.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenWeeksAgo }
                }
            },
            {
                $project: {
                    week: { $isoWeek: "$createdAt" },
                    year: { $isoWeekYear: "$createdAt" },
                    orderAmount: 1
                }
            },
            {
                $group: {
                    _id: { week: "$week", year: "$year" },
                    totalAmount: { $sum: "$orderAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.week": 1 }
            },
            {
                $project: {
                    _id: 0,
                    week: "$_id.week",
                    year: "$_id.year",
                    totalAmount: 1,
                    orderCount: 1,
                    startOfWeek: { $dateToString: { format: "%Y-%m-%d", date: { $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week", isoDayOfWeek: 1 } } } },
                    endOfWeek: { $dateToString: { format: "%Y-%m-%d", date: { $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week", isoDayOfWeek: 7 } } } }
                }
            }
        ]);


        res.render('salesReport', { weeklyReport, page: 'weekly', TotalAmount });
    } catch (error) {
        console.log('error in weekly sales report', error);
        res.status(500).send('Error generating weekly sales report');
    }
};


const monthlySalesReport = async (req, res) => {
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


        const today = new Date();
        const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, today.getDate());

        const monthlyReport = await orders.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                    orderAmount: 1
                }
            },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    orderedProductCount: { $sum: 1 },
                    totalAmount: { $sum: "$orderAmount" }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);


        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthlyReport.forEach(report => {
            const monthIndex = report._id.month - 1;
            report._id.monthName = monthNames[monthIndex];
            report._id.monthYear = `${report._id.monthName}-${report._id.year}`;
        });


        res.render('salesReport', {
            report: monthlyReport,
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