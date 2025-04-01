const jwt = require('jsonwebtoken')
const {db} = require('../config/db')
const fs = require('fs')

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET , {expiresIn: '4h'})
}

function verifyAccessToken(token){
   try {
      return jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
   } catch (error) {
    return null
   }
}

function normalAuth(req,res,next){
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(404).json({
            success : false,
            message : "Not Authenticated !"
        })
    }

    const decoded = verifyAccessToken(token)
    if(!decoded){
        return res.status(401).json({
            success : false,
            message : "Token not verified !"
        })
    }

    req.user = decoded
    next()
}

module.exports = {generateAccessToken , normalAuth}