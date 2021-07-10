const express = require('express')
const bodyParse = require('body-parser')

const promotionRouter = express.Router()
promotionRouter.use(bodyParse.json())


promotionRouter.route('/')
.all((req, res, next) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) =>{
    res.end('Will send to you!');
})
.post((req, res, next) =>{
    res.end('Add the promotion');
})
.put((req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported");
})
.delete((req, res, next) =>{
    res.end('Delete all promotions !');
})

promotionRouter.route('/:promotionId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) =>{
    res.end('Will send ' + req.params.promotionId +' to you!');
})
.post((req, res, next) =>{
    res.end('Add the promotion: ' + req.body.name + 'with ' + req.body.description);
})
.put((req, res, next) =>{
    res.write('Updataing the promotion: ' + req.params.promotionId + '\n');
    res.end("Update : " + req.body.name + 'with details: ' + req.body.description);
})
.delete((req, res, next) =>{
    res.end('Delete promotion: ' + req.params.promotionId);
})

module.exports = promotionRouter;