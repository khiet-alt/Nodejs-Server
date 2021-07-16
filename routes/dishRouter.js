const express = require('express')
const bodyParse = require('body-parser')
const mongoose = require('mongoose')
const authenticate = require('../authenticate')

const Dishes = require('../models/dishes')

const dishRouter = express.Router()
dishRouter.use(bodyParse.json())    // parse body and load it into request

dishRouter.route('/')
.get((req, res, next) =>{
    Dishes.find({})
        .populate('comments.author')
        .then((dishes) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dishes)
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) =>{ // mean: call authenticate.verify first if have an error will send back to client, if not , execute callback(req, res, next)
    Dishes.create(req.body)
        .then((dish) => {
            console.log('Dish created: ', dish)
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.put(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT");
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Dishes.remove({})
        .then((resp) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(resp)
        }, (err) => next(err))  
        .catch(err => next(err))
})

dishRouter.route('/:dishId')
.get((req, res, next) =>{
    Dishes.findById(req.params.dishId)   //findbyid available at mongoose as well mongodb
        .populate('comments.author')
        .then((dish) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403
    res.end('POST operation not supported on dishes: ' + req.params.dishId);
})
.put(authenticate.verifyUser, (req, res, next) =>{
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
.delete(authenticate.verifyUser, (req, res, next) =>{
    Dishes.findByIdAndRemove(req.params.dishId)
        .then((dish) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(dish)
        }, (err) => next(err))  
        .catch(err => next(err))
})

dishRouter.route('/:dishId/comments')
.get((req, res, next) =>{
    Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish) => {
            if (dish) {
                res.statusCode = 200,
                res.setHeader('Content-Type', 'application/json')
                res.json(dish.comments)
            }
            else {
                var err = new Error('Dish ' + req.params.dishId + ' not Found')
                err.status = 404
                return next(err)    // pass err to app.js file handling
            }
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                req.body.author = req.user._id;
                dish.comments = dish.comments.concat([req.body]);
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        })            
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT on /dishes/" + req.params.dishId + "/comments");
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish) {
                for (let i = (dish.comments.length - 1); i >= 0; i--)
                    dish.comments.id(dish.comments[i]._id).remove()
                dish.save()     // saved dishComment
                    .then((dish) => {
                        res.statusCode = 200,
                        res.setHeader('Content-Type', 'application/json')
                        res.json(dish)
                    }, err => next(err))
            }
            else {
                var err = new Error('Dish ' + req.params.dishId + ' not Found')
                err.status = 404
                return next(err)    // pass err to app.js file handling
            }
        }, (err) => next(err))  
        .catch(err => next(err))
})

dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) =>{
    Dishes.findById(req.params.dishId)   //findbyid available at mongoose as well mongodb
        .populate('comments.author')
        .then((dish) => {
            if (dish && dish.comments.id(req.params.commentId)) {
                res.statusCode = 200,
                res.setHeader('Content-Type', 'application/json')
                res.json(dish.comments.id(req.params.commentId))
            }
            else if (dish == null){
                var err = new Error('Dish ' + req.params.dishId + ' not Found')
                err.status = 404
                return next(err)    // pass err to app.js file handling
            }
            else {
                var err = new Error('Comment ' + req.params.commentId + ' not Found')
                err.status = 404
                return next(err)
            }
        }, (err) => next(err))  
        .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403
    res.end('POST operation not supported on dishes: ', req.params.dishId + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req, res, next) =>{
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish && dish.comments.id(req.params.commentId)) {
                if (req.body.rating)        
                    dish.comments.id(req.params.commentId).rating = req.body.rating     // becauz no way explicit that mongoose supports for updating an embedded document
                if (req.body.comment)
                    dish.comments.id(req.params.commentId).comment = req.body.comment
                dish.save()     // saved dishComment
                    .then((dish) => {
                        Dishes.findById(dish_.id)
                            .populate('comments.author')
                            .then(dish => {
                                res.statusCode = 200,
                                res.setHeader('Content-Type', 'application/json')
                                res.json(dish)
                            })
                    }, err => next(err))
            }
            else if (dish == null){
                var err = new Error('Dish ' + req.params.dishId + ' not Found')
                err.status = 404
                return next(err)    // pass err to app.js file handling
            }
            else {
                var err = new Error('Comment ' + req.params.commentId + ' not Found')
                err.status = 404
                return next(err)
            }
        }, (err) => next(err))  
        .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) =>{
    Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish && dish.comments.id(req.params.commentId)) {
                dish.comments.id(req.params.commentId).remove()
                dish.save()
                    .then((dish) => {
                        Dishes.findById(dish_.id)
                            .populate('comments.author')
                            .then(dish => {
                                res.statusCode = 200,
                                res.setHeader('Content-Type', 'application/json')
                                res.json(dish)
                            })
                    }, err => next(err))
            }
            else if (dish == null){
                var err = new Error('Dish ' + req.params.dishId + ' not Found')
                err.status = 404
                return next(err)    // pass err to app.js file handling
            }
            else {
                var err = new Error('Comment ' + req.params.commentId + ' not Found')
                err.status = 404
                return next(err)
            }
        }, (err) => next(err))  
        .catch(err => next(err))
})

module.exports = dishRouter;