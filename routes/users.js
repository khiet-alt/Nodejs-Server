var express = require('express');
const bodyParse = require('body-parser')
var User = require('../models/user')
var passport = require('passport')

var router = express.Router();
router.use(bodyParse.json())

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {      // sign up endpoint
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
      if (err){
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({err: err})
      }
      else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json({success: true, status: 'Registration Successful'})
        })
      }
    })
})

router.post('/login', passport.authenticate('local'), (req, res) => {   // when fail, authenticate will automate send res to client
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({success: true, status: 'You are successfully logged in'})
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
