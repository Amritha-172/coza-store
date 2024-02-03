const express = require('express');
const app = express()
const session = require('express-session')
const nocache = require('nocache');
const morgan = require('morgan')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const flash = require('express-flash')


require('./config/config').connect()


app.use(express.static('public'))
app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(flash())
app.use("/", userRoute)
app.use("/admin", adminRoute)







app.listen(3000, () => {
  console.log('server is Running at http://localhost:3000');
})