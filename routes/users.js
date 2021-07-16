var express = require('express');
const bodyParse = require('body-parser')
var User = require('../models/user')

var router = express.Router();
router.use(bodyParse.json())

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {      // sign up endpoint
  User.findOne({username: req.body.username})
    .then(user => {
      if (user != null){
        var err = new Error('User ' + req.body.username + ' already exist')
        err.status  = 403
        next(err)
      }
      else {
        return User.create({
          username: req.body.username,
          password: req.body.password
        })
      }
    })
    .then(user => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({status: 'Registration Successful', user: user})
    }, err => next(err))
    .catch(err => next(err))
})

router.post('/login', (req, res, next) => {   // login endpoint
  if (!req.session.user){
    var authHeader = req.headers.authorization  

    if (!authHeader){
      var err = new Error('You are not authenticated')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }
  
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')  // form : "username:password"
    var username = auth[0]
    var password = auth[1]

    User.findOne({username: username})
      .then(user => {
        if (user === null) {
          var err = new Error('User ' + username + "doesn't exist")
          err.status = 403
          return next(err)
        }
        else if (user.password !== password) {
          var err = new Error('Your password is incorrect!')
          err.status = 403
          return next(err)
        }
        else if (user.username === username && user.password === password){
          req.session.user = 'authenticated'
          req.statusCode = 200
          res.setHeader('Content-Type', 'text/plain')
          res.end('You are authenticated')
        }
      })
      .catch(err => next(err))
  }
  else {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('You are already authenticated')
  }
})

router.get('/logout', (req, res) => {     // logout endpoint
  if (req.session){
    req.session.destroy()     // remove session information from the server side 
    res.clearCookie('session-id')   // delete this cookie from the client side
    res.redirect('/')
  }
  else {
    var err = new Error('You are not logged in')
    err.status = 403
    next(err)
  }
})

module.exports = router;
