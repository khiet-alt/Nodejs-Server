const express = require('express')
const bodyParse = require('body-parser')
const authenticate = require('../authenticate')
const cors = require('./cors')

const Movie = require('../models/movies')

const movieRouter = express.Router()
movieRouter.use(bodyParse.json())    // parse body and load it into request

movieRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
.get(cors.cors, (req, res, next) =>{
    Movie.find(req.query)
        .then((movie) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(movie)
        }, (err) => next(err))  //next: if err returned, it is passed off
        .catch(err => next(err))
})
.post(cors.corsWithOptions, (req, res, next) =>{ // mean:(chaining) call authenticate.verify first if have an error will send back to client, if not , execute callback(req, res, next)
    Movie.create(req.body)
        .then((movie) => {
            res.statusCode = 200,
            res.setHeader('Content-Type', 'application/json')
            res.json(movie)
        }, (err) => next(err))  
        .catch(err => next(err))
})

module.exports = movieRouter