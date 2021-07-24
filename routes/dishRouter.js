const express = require('express')
const bodyParse = require('body-parser')
const mongoose = require('mongoose')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Dishes = require('../models/dishes')

const dishRouter = express.Router()
dishRouter.use(bodyParse.json())    // parse body and load it into request

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, (req, res, next) =>{
    Dishes.find(req.query)
        .populate('comments.author')
        .then((dishes) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dishes)
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{ // mean:(chaining) call authenticate.verify first if have an error will send back to client, if not , execute callback(req, res, next)
    Dishes.create(req.body)
        .then((dish) => {
            console.log('Dish created: ', dish)
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    Dishes.remove({})
        .then((resp) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(resp)
        }, (err) => next(err))  
        .catch(err => next(err))
})

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, (req, res, next) =>{
    Dishes.findById(req.params.dishId)   //findbyid available at mongoose as well mongodb
        .populate('comments.author')
        .then((dish) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    res.statusCode = 403
    res.end('POST operation not supported on dishes: ' + req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
        .then((dish) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    Dishes.findByIdAndRemove(req.params.dishId)
        .then((dish) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})

module.exports = dishRouter