var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var FileStore = require('session-file-store')(session)
var passport = require('passport')
var authenticate = require('./authenticate')
var config = require('./config')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter')
var promoRouter = require('./routes/promoRouter')
var leaderRouter = require('./routes/leaderRouter')
var uploadRouter = require('./routes/uploadRouter')
var favoriteRouter = require('./routes/favoriteRouter')
var commentRouter = require('./routes/commentRouter')

const mongoose = require('mongoose');

const url = config.mongoUrl
mongoose.Promise = global.Promise   // add this to remove warning deprecated
const connect = mongoose.connect(url, {useMongoClient:true});

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err) })

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));

app.use(passport.initialize())

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));  // enable us to serve static data in public folder

app.use('/dishes', dishRouter)
app.use('/comments', commentRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)
app.use('/uploadImage', uploadRouter)
app.use('/favorites', favoriteRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler, this will return error back to client
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
