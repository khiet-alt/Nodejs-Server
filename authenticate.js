var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('./models/user')

exports.local = passport.use(new LocalStrategy(User.authenticate())) // User.authenticate(): is provided by passport-local-mongoose(by moddel), if not use, we must implement my own
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())