
const isLogin=async(req,res,next)=>{
    try {
        if(req.session.user_id){
         next()
        } else{
         res.redirect('/')
        }
        
    } catch (error) {
        console.log(error.message); 
    }
}
const isLogout=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isBlocked = async (req, res, next) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id })
        if (!userData) {
            next();
        } else {
            console.log(userData.isBlocked)
            if (userData.isBlocked) {
                res.redirect('/login')
            } else {
                next();
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    isLogin,
    isLogout,
    isBlocked
    
}