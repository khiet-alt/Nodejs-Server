const express = require('express')
const bodyParse = require('body-parser')
const authenticate = require('../authenticate')
const Promos = require('../models/promotions')

const promotionRouter = express.Router()
promotionRouter.use(bodyParse.json())

promotionRouter.route('/')
.get((req, res, next) =>{
    Promos.find({})
        .then((promos) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(promos)
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) =>{
    Promos.create(req.body)
        .then((promo) => {
            console.log('promo created: ', promo)
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(promo)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.put(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT");
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Promos.remove({})
        .then((resp) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(resp)
        }, (err) => next(err))  
        .catch(err => next(err))
})

promotionRouter.route('/:promoId')
.get((req, res, next) =>{
    Promos.findById(req.params.promoId)   //findbyid available at mongoose as well mongodb
        .then((promo) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(promo)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403
    res.end('POST operation not supported on Promos: ' + req.params.promoId);
})
.put(authenticate.verifyUser, (req, res, next) =>{
    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, { new: true })
        .then((promo) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(promo)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Promos.findByIdAndRemove(req.params.promoId)
        .then((promo) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(promo)
        }, (err) => next(err))  
        .catch(err => next(err))
})

module.exports = promotionRouter;