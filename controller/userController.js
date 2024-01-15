const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message);
    }
}

const signup = async (req, res) => {
    try {
        res.render("register",)
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {
    try {
        const {password,confirmPassword}=req.body;
        const spassword = await securePassword(password)
        const cpassword= await securePassword(confirmPassword)
        if(password!==confirmPassword){
             res.render('register',{messages:"password and confirm password is wrong"})
        }
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            // image: req.file.filename,
            password: spassword,
            confirmPassword:cpassword
        

        })

        const userData = await user.save()

        if (userData) {
            res.render('register', { message: "Your registration is successfully completed" })
        } else {
            res.render('register', { message: "Your registration has been failed" })
        }

    } catch (error) {
        console.log(error.message);
    }
}



const userLogin = async (req, res) => {
    try {
        res.render('login',)
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async(req,res)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;

     const userData = await User.findOne({email:email});  

     if(userData){ 
      const passwordMatch = await bcrypt.compare(password,userData.password)
//authentication of user
      if (passwordMatch) {

        req.session.user_id = userData._id; 
        res.redirect('/home');

      } else {
        res.render('login',{message:'Email or password is incorrect'})
      }
     } 
     else{
      res.render('login',{message:'Email or password is incorrect'})
     }

  } catch (error) {
    console.log(error.message);
  }
}



const Homepage = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id})
        res.render('home', { user: userData })
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.user_id = null
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
  signup,
    insertUser,
    userLogin,
    userLogout,
    Homepage,
    verifyLogin,
   
}