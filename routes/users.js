var express = require('express');
const bodyParse = require('body-parser')
var User = require('../models/user')
var passport = require('passport')
var authenticate = require('../authenticate')
const cors = require('./cors')

var router = express.Router();
router.use(bodyParse.json())

/* GET users listing. */
router.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200)
})

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

/*login: need in header: token in bearer(authentication) will add 'user' in request, need in body: username, password */
router.post('/login',cors.corsWithOptions, (req, res, next) => {   // when fail, authenticate will automate send res to client
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err)
    if (!user) { // if was not an error, perhap the user couldn't be found or passwod incorrect
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      res.json({success: false, status: 'Logged in unsuccessful', err: info})
    }
    req.logIn(user, (err) => {
      if (err) {
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        res.json({success: false, status: 'Logged in unsuccessful', err: 'Could not login'})
      }

      var token = authenticate.getToken({_id: req.user._id})
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({success: true, status: 'Logged in unsuccessful', token: token})
    })
  }) (req, res, next) // this is a structure for pass params (req, res, next) into callback(err, user, info)
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

router.get('/checkJWTToken', cors.corsWithOptions, (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)  return next(err)
    if (!user) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'Application/json')
      return res.json({status: 'JWT invalid', success: false, err: info})
    }
    else {
      res.statusCode = 200
      res.setHeader('Content-Type', 'Application/json')
      return res.json({status: 'valid', success: true, user: user})
    }
  }) (req, res)
})

module.exports = router;