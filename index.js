const express = require('express');
const userRoute=require('./routes/userRoute')
const mongoose = require('mongoose');
const nocache = require('nocache');


mongoose.connect('mongodb://localhost:27017/cozaStore')



const app = express()
// app.set('view engine','ejs')
// app.set("views","views/user")
app.use(express.static('public'))
app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/",userRoute)



app.listen(3000,()=>{
    console.log('server is Running at http://localhost:3000');
})