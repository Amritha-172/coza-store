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
        res.render("dashboard", {})
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