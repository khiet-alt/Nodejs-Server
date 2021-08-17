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
                    if (favor.movies.indexOf(req.body[i]) !== -1) 
                        continue;
                    else 
                        favor.movies = favor.movies.concat(req.body[i])

                favor.save()
                    .then(favor => {
                        Favorite.findOne({user: req.user._id})
                            .populate('user')
                            .then(favor => {
                                res.statusCode = 200
                                res.setHeader('Content-Type', 'application/json')
                                res.json(favor)
                            }, err => next(err))
                    }, err => next(err))
            }
            else {
                Favorite.create({user: req.user._id, "movies": req.body}, (err, doc) => {
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

favoriteRouter.route('/:movieId')
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
                if (favor.movies.indexOf(req.params.movieId) < 0){
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
                if (favor.movies.indexOf(req.params.movieId) == -1)
                    favor.movies = favor.movies.concat({_id: req.params.movieId})
                favor.save()
                    .then(favor => {
                        Favorite.findOne({user: req.user._id})
                            .populate('user')
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
                        doc.movies = doc.movies.concat({_id: req.params.movieId})
                        doc.save()
                        .then(favor => {
                            Favorite.findOne({user: req.user._id})
                                .populate('user')
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
            if (favor && favor.movies.indexOf(req.params.movieId) !== -1){
                favor.movies.splice(favor.movies.indexOf(req.params.movieId), 1)

                favor.save((err, doc) => {
                    doc.populate('user')
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