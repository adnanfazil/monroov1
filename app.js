var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
require("dotenv").config();


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var lookups = require('./apis/lookups');
app.use('/monroo/apis/lookups', lookups);

var apiUser = require('./apis/user');
app.use('/monroo/apis/user', apiUser);

app.use('/', (req, res) => {
  return res.redirect('monroo');
})

app.use('/*', (req, res) => {
    res.status(404).send({
      message: "not found"
    })
  })

  // catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  
  module.exports = app;