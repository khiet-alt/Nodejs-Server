const express = require('express')
const bodyParse = require('body-parser')

const leaderRouter = express.Router()
leaderRouter.use(bodyParse.json())

leaderRouter.route('/')
.all((req, res, next) =>{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) =>{
    res.end('Will send to you!');
})
.post((req, res, next) =>{
    res.end('Add the leader');
})
.put((req, res, next) =>{
    res.statusCode = 403;
    res.end("Not supported");
})
.delete((req, res, next) =>{
    res.end('Delete all leaders!');
})

leaderRouter.route('/:leaderId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) =>{
    res.end('Will send ' + req.params.leaderId +' to you!');
})
.post((req, res, next) =>{
    res.end('Add the leader: ' + req.body.name + 'with ' + req.body.description);
})
.put((req, res, next) =>{
    res.write('Updataing the leader: ' + req.params.leaderId + '\n');
    res.end("Update : " + req.body.name + 'with details: ' + req.body.description);
})
.delete((req, res, next) =>{
    res.end('Delete leader: ' + req.params.leaderId);
})

module.exports = leaderRouter;