require('dotenv').config()
const express = require('express')
const PORT = process.env.PORT || 3000
const app = express()
const authRoutes = require('./route/authroute')
const userRoutes = require('./route/userroute')

// Middlewares
app.use(express.json())

app.use('/api/v1', authRoutes)
app.use('/api/user', userRoutes)


app.listen(PORT , ()=>{
    console.log(`Server is working fine at port ${PORT}`)
})





