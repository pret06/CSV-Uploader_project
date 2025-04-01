const mysql = require('mysql2/promise')

const db = mysql.createPool({
    host : process.env.DB_HOST ,
    user : process.env.DB_USERNAME,
    password : process.env.DB_PASSWORD || '',
    database : process.env.DATABASE,
})

module.exports = {db}