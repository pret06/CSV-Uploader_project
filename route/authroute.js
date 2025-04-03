const express = require('express')
const { loginController, registerController } = require('../controller/authcontroller')
const router = express.Router()
const path = require('path')
const multer = require('multer')
const { normalAuth } = require('../utils/auth.utils')
const uploadcsv = require('../controller/csv-upload-controller')

const storage = multer.diskStorage({
    destination : (req, file,cb)=>{
        const __basedir = path.resolve()
        cb(null, __basedir , '/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
})

const csvfilter = (file,cb)=>{
    const allowedmimietype = ['text/csv']
    if(allowedmimietype.includes(file.mimetype)){
        cb(null, true)
    } else {
        cb(new Error ('only csv file upload is valid !'), false)
    }
}

const uploadFile = multer({storage , fileFilter : csvfilter})
router.post('/csv-upload' , normalAuth , uploadFile.single('file') , uploadcsv)

router.post('/register', registerController)
router.post('/login', loginController)

module.exports = router