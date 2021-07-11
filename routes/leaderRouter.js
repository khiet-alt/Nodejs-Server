const express = require('express')
const bodyParse = require('body-parser')

const Leaders = require('../models/leaders')

const leaderRouter = express.Router()
leaderRouter.use(bodyParse.json())

leaderRouter.route('/')
.get((req, res, next) =>{
    Leaders.find({})
        .then((leaders) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(leaders)
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post((req, res, next) =>{
    Leaders.create(req.body)
        .then((leader) => {
            console.log('leader created: ', leader)
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(leader)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.put((req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported method PUT");
})
.delete((req, res, next) =>{
    Leaders.remove({})
        .then((resp) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(resp)
        }, (err) => next(err))  
        .catch(err => next(err))
})

leaderRouter.route('/:leaderId')
.get((req, res, next) =>{
    Leaders.findById(req.params.leaderId)   //findbyid available at mongoose as well mongodb
        .then((leader) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(leader)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.post((req, res, next) =>{
    res.statusCode = 403
    res.end('POST operation not supported on Leaders: ' + req.params.leaderId);
})
.put((req, res, next) =>{
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, { new: true })
        .then((leader) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(leader)
        }, (err) => next(err))  
        .catch(err => next(err))
})
.delete((req, res, next) =>{
    Leaders.findByIdAndRemove(req.params.leaderId)
        .then((leader) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(leader)
        }, (err) => next(err))  
        .catch(err => next(err))
})

module.exports = leaderRouter;