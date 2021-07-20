var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('./models/user')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt
var jwt = require('jsonwebtoken')
var FacebookTokenStrategy = require('passport-facebook-token')

var config = require('./config')

exports.local = passport.use(new LocalStrategy(User.authenticate())) // User.authenticate(): is provided by passport-local-mongoose(by moddel), if not use, we must implement my own
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600}) // 3600s = 1 hour
}

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = config.secretKey

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {   // configuring strategy
    console.log('JWT payload: ', jwt_payload)
    User.findOne({_id: jwt_payload._id}, (err, user) => {   // user: user in request.
        if (err){
            return done(err, false)
        }
        else if (user){
            return done(null, user)
        }
        else {
            return done(null, false)
        }
    })
}))

exports.verifyUser = passport.authenticate('jwt', {session: false})

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin)
        next()
    else {
        var err = new Error('You are not authorized to perform this operation!')
        err.status = 403
        next(err)
    }
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profileToken, done) => {
        User.findOne({facebookId: profileToken.id}, (err, user) => {
            if (err)
                return done(err, false)
            else if (!err && user !== null)
                return done(null, user)
            else {
                user = new User({username: profileToken.displayName})
                user.facebookId = profileToken.id
                user.fisrtname = profileToken.name.givenName
                user.lastName = profileToken.name.familyName
                user.save((err, user) => {
                    if (err)
                        return done(err, false)
                    else 
                        return done(null, user)
                })
            }
        })
    }
))