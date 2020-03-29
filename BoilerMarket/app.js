const express = require('express');
const path = require('path');
const mysql = require('mysql');
const hbs = require('hbs');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
var passport = require("passport");
var request = require("request");
const http = require('http');

const app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

// Start HTTP Server
const port = 80;

app.engine('.hbs', exphbs({
  extname: 'hbs',
  defaultLayout: null,
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: require("./Helpers/handlebars.js").helpers,
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

//Load Page Routes
const indexRoute = require('./routes/index');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const logoutRoute = require('./routes/logout');
const dashboardRoute = require('./routes/dashboard');
const profileRoute = require('./routes/profile');
const cartRoute = require('./routes/cart');
const listingsRoute = require('./routes/listings');
const forgotPasswordRoute = require('./routes/forgot-password');
const transactionsRoute = require('./routes/transactions');
const checkoutRoute = require('./routes/checkout');
const chatRoute = require('./routes/chat');

// Static folder
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Express Session
app.use(session({
    secret: 'q3lk4gnk3ngkl3kgnq3klgn',
    saveUninitialized: false,
    resave: false
}));
app.use(flash());
app.use(expressValidator());
// Passport init
app.use(passport.initialize());
app.use(passport.session());


//socket io stuff
app.use(function(req,res,next){
  req.io = io;
  next();
});

// Use routes
app.use('/', indexRoute);
app.use('/', loginRoute);
app.use('/', registerRoute);
app.use('/', logoutRoute);
app.use('/', dashboardRoute);
app.use('/', profileRoute);
app.use('/', cartRoute);
app.use('/', listingsRoute);
app.use('/', forgotPasswordRoute);
app.use('/', transactionsRoute);
app.use('/', checkoutRoute);
app.use('/', chatRoute);

server.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});