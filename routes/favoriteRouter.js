const express = require('express')
const bodyParse = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Favorite = require('../models/favorite')

const favoriteRouter = express.Router()
favoriteRouter.use(bodyParse.json())

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .populate('user')
        .populate('dishes')
        .then(favor => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(favor)
        }, err => next(err))
        .catch(err => next(err))
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .then(favor => {
            if (favor){
                for (let i = 0; i < req.body.length; i++)
                    if (favor.dishes.indexOf(req.body[i]) !== -1) 
                        break;
                    else 
                        favor.dishes = favor.dishes.concat(req.body[i])

                favor.save()
                    .then(favor => {
                        Favorite.findOne({user: req.user._id})
                            .populate('user')
                            .populate('dishes')
                            .then(favor => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json')
                                res.json(favor)
                            }, err => next(err))
                    }, err => next(err))
            }
            else {
                Favorite.create({user: req.user._id, "dishes": req.body}, (err, doc) => {
                    if (err){
                        res.statusCode = 500
                        res.setHeader('Content-Type', 'application/json')
                        res.json({err: err})
                      }
                    else {
                        doc.save()
                        .then(favor => {
                            Favorite.findOne({user: req.user._id})
                                .populate('user')
                                .populate('dishes')
                                .then(favor => {
                                    res.statusCode = 200
                                    res.setHeader('Content-Type', 'application/json')
                                    res.json(favor)
                                }, err => next(err))
                        }, err => next(err))
                    }
                })
            }
        }, err => next(err))
        .catch(err => next(err))
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndRemove({user: req.user._id})
        .then(favor => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favor);
        }, err => next(err))
        .catch(err => next(err))
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .then(favor => {
            if (!favor){
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json({"exists": false, "favorites": favor})
            }
            else{
                if (favor.dishes.indexOf(req.params.dishId) < 0){
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json({"exists": false, "favorites": favor})
                }
                else {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json({"exists": true, "favorites": favor})
                }
            }
        }, err => next(err))
        .catch(err => next(err))
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .then(favor => {
            if (favor){
                if (favor.dishes.indexOf(req.params.dishId) == -1)
                    favor.dishes = favor.dishes.concat({_id: req.params.dishId})
                favor.save()
                    .then(favor => {
                        Favorite.findOne({user: req.user._id})
                            .populate('user')
                            .populate('dishes')
                            .then(favor => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json')
                                res.json(favor)
                            }, err => next(err))
                    }, err => next(err))
            }
            else {
                Favorite.create({user: req.user._id}, (err, doc) => {
                    if (err){
                        res.statusCode = 500
                        res.setHeader('Content-Type', 'application/json')
                        res.json({err: err})
                      }
                    else {
                        doc.dishes = doc.dishes.concat({_id: req.params.dishId})
                        doc.save()
                        .then(favor => {
                            Favorite.findOne({user: req.user._id})
                                .populate('user')
                                .populate('dishes')
                                .then(favor => {
                                    res.statusCode = 200
                                    res.setHeader('Content-Type', 'application/json')
                                    res.json(favor)
                                }, err => next(err))
                        }, err => next(err))
                    }
                })
            }
        }, err => next(err))
        .catch(err => next(err))
})
.delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .then(favor => {
            if (favor && favor.dishes.indexOf(req.params.dishId) !== -1){
                favor.dishes.splice(favor.dishes.indexOf(req.params.dishId), 1)

                favor.save((err, doc) => {
                    doc.populate('user')
                        .populate('dishes')
                        .execPopulate()
                        .then(resolve => {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(resolve)
                        }, err => next(err))
                })
            }
            else {
                res.statusCode = 404
                res.setHeader('Content-Type', 'application/json')
                res.json({err: "Not found favorite"})
            }
        }, err => next(err))
        .catch(err => next(err))
})

module.exports = favoriteRouter