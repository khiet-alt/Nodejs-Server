var express = require('express');
const bodyParse = require('body-parser')
var User = require('../models/user')
var passport = require('passport')
var authenticate = require('../authenticate')
const cors = require('./cors')

var router = express.Router();
router.use(bodyParse.json())

/* GET users listing. */
router.get('/',cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then(users =>{
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(users)
    }, err => next(err))
    .catch(err => next(err))
});

/*sign up: need in body: {"username", "password", "firstname, lastname: optional"} */
router.post('/signup',cors.corsWithOptions,  (req, res, next) => {      // sign up endpoint
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
      if (err){
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({err: err})
      }
      else {
        if (req.body.firstname)
          user.firstname = req.body.firstname
        if (req.body.lastname)
          user.lastname = req.body.lastname
        user.save((err, user) => {
          if (err){
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.json({err: err})
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({success: true, status: 'Registration Successful'})
          })
        })
      }
    })
})

/*login: need in header: token in bearer(authentication), need in body: username, password */
router.post('/login',cors.corsWithOptions,  passport.authenticate('local'), (req, res) => {   // when fail, authenticate will automate send res to client
  var token = authenticate.getToken({_id: req.user._id})
  
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({success: true, token: token, status: 'You are successfully logged in'})
})

router.get('/logout', (req, res, next) => {     // logout endpoint
  if (req.session){
    req.session.destroy()     // remove session information from the server side 
    res.clearCookie('session-id')   // delete this cookie from the client side
    res.redirect('/')
  }
  else {
    var err = new Error('You are not logged in')
    err.status = 401
    next(err)
  }
})
/**
Can you both authorization: bearer ... or access_token: ...
  or in queries param: ...?access_token=...
 */
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user){
    var token = authenticate.getToken({_id: req.user._id})    // access token from facebook
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json({success: true, token: token, status: 'You are successfully logged in'})
  }
})
// derived access_token from fb then add it to header to query other method without /login
module.exports = router;