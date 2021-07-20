const express = require('express')
const bodyParse = require('body-parser')
const authenticate = require('../authenticate')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpg|png|gif)$/)) {
        return cb(new Error('You can upload image file'), false)
    }
    cb(null, true)
}

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
})

const uploadRoute = express.Router()

uploadRoute.use(bodyParse.json())    // parse body and load it into request

uploadRoute.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method GET");
})
/*
    in POSTMAN: body: 
        key: imageFile
*/
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single(), (req, res, next) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.json(req.file)      // req.file obj contain the path to the file in there, supply client knowing the location of image file can accessible in server side
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT");
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method DELETE");
})

module.exports = uploadRoute