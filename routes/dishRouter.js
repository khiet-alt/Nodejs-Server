const express = require('express')
const bodyParse = require('body-parser')

const dishRouter = express.Router()
dishRouter.use(bodyParse.json())

dishRouter.route('/')
.all((req, res, next) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) =>{
    res.end('Will send to you!');
})
.post((req, res, next) =>{
    res.end('Add the dish');
})
.put((req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported");
})
.delete((req, res, next) =>{
    res.end('Delete all dishes!');
})

dishRouter.route('/:dishId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) =>{
    res.end('Will send ' + req.params.dishId +' to you!');
})
.post((req, res, next) =>{
    res.end('Add the dish: ' + req.body.name + 'with ' + req.body.description);
})
.put((req, res, next) =>{
    res.write('Updataing the dish: ' + req.params.dishId + '\n');
    res.end("Update : " + req.body.name + 'with details: ' + req.body.description);
})
.delete((req, res, next) =>{
    res.end('Delete dish: ' + req.params.dishId);
})

module.exports = dishRouter;