var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

global.appRoot = path.resolve(__dirname);
global.fileRoot = appRoot + '/files';

var WebTorrent = require('webtorrent');
var client = new WebTorrent();
var rimraf = require('rimraf');


var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//connect to MongoDB
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;


var index = require('./routes/index');
var api = require('./api');

var app = express();





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make webtorrent accessible to our router
app.use(function(req, res, next) {
  // req.mongoClient = MongoClient
  req.torrentClient = client;
  req.rimraf = rimraf;
  next();
});

//use sessions for tracking logins
app.use(session({
    secret: '181hf00ncy1rt621b',
    // resave: true,
    // saveUninitialized: false,
    // cookie: {
    //     path    : '/',
    //     httpOnly: false,
    //     maxAge  : 24*60*60*1000
    // },
    store: new MongoStore({
        mongooseConnection: db
    })
}));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
