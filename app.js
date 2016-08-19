var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//_maxListeners
require('events').EventEmitter.prototype._maxListeners = 15;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Library routes
var library = {};
library.library = require('./routes/jmu/library/library');
library.bookInfo = require('./routes/jmu/library/bookinfo');
library.login = require('./routes/jmu/library/login');
library.userinfo = require('./routes/jmu/library/user/userinfo');
library.borrowed = require('./routes/jmu/library/user/borrowed');
library.bookshelf = require('./routes/jmu/library/user/bookshelf');

//Amoy_Bus
var amoyBus = {};
amoyBus.linequery = require('./routes/amoy/bus/linequery');
amoyBus.changequery = require('./routes/amoy/bus/changequery');
amoyBus.linedetailquery = require('./routes/amoy/bus/linedetailquery');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//Library routes
app.use('/jmu/library/search', library.library);
app.use('/jmu/library/book', library.bookInfo);
app.use('/jmu/library/login', library.login);
app.use('/jmu/library/userinfo', library.userinfo);
app.use('/jmu/library/borrowed', library.borrowed);
app.use('/jmu/library/bookshelf', library.bookshelf);

//amoyBus
app.use('/amoybus/line', amoyBus.linequery);
app.use('/amoybus/change', amoyBus.changequery);
app.use('/amoybus/detail', amoyBus.linedetailquery);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
