const express = require('express')
const bodyParse = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Comments = require('../models/comments')

const commentRouter = express.Router()
commentRouter.use(bodyParse.json())    // parse body and load it into request

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, (req, res, next) =>{
    Comments.find(req.query)
        .populate('author')
        .then((comments) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(comments)
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.author = req.user._id
        Comments.create(req.body)
            .then((comment) => {
                Comments.findById(comment._id)
                    .populate('author')
                    .then(comment => {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'Application/json')
                        res.json(comment)
                    })
            }, (err) => next(err))
        .catch((err) => next(err))
    }
    else {
        err = new Error('Comment not found in req body')
        err.status = 404
        return next(err)
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT on /comments");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    Comments.remove({})
        .then((response) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'Application/json')
            res.json(response)
        }, (err) => next(err))  
        .catch(err => next(err))
})

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) =>{
    Comments.findById(req.params.commentId)   //findbyid available at mongoose as well mongodb
        .populate('author')
        .then((comment) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(comment)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    res.statusCode = 403
    res.end('POST operation not supported on /comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Comments.findById(req.params.commentId)
        .then((comment) => {
            if (comment) {
                if (req.user._id.equals(comment.author)){
                    req.body.author = req.user._id

                    Comments.findByIdAndUpdate(req.params.commentId, {$set: req.body},
                        {issue: true})  // ensure that updated comment will be returned in then of this call
                    .then((comment) => {
                        Comments.findById(comment._id)               // fig bug in here(from previous commit)
                            .populate('author')
                            .then(comment => {
                                res.statusCode = 200,
                                res.setHeader('Content-Type', 'application/json')
                                res.json(comment)
                            })
                            .catch(err => next(err))
                    }, err => next(err))
                    .catch(err => next(err))
                }
                else {
                    var err = new Error('User account ' + req.user.username + ' is not the author of the comment')
                    err.status = 403
                    return next(err)
                }
            } 
            else {
                var err = new Error('Comment ' + req.params.commentId + ' not Found')
                err.status = 404
                return next(err)
            }
        }, (err) => next(err))  
        .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
    Comments.findById(req.params.commentId)
        .then(comment => {
            if (comment) {
                if (req.user._id.equals(comment.author)){
                    Comments.findByIdAndRemove(req.params.commentId)
                        .then(response => {
                            res.statusCode = 200,
                            res.setHeader('Content-Type', 'application/json')
                            res.json(response)
                        }, err => next(err))
                        .catch(err => next(err))
                } else {
                    var err = new Error('User account ' + req.user.username + ' is not the author of the comment')
                    err.status = 403
                    return next(err)
                }
            }
            else {
                var err = new Error('Comment ' + req.params.commentId + ' not Found')
                err.status = 404
                return next(err)
            }
        }, (err) => next(err))  
        .catch(err => next(err))
})

module.exports = commentRouter;