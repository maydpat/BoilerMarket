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

const app = express();

// Start HTTP Server
const port = 80;

app.engine('.hbs', exphbs({
  extname: 'hbs',
  defaultLayout: null,
  partialsDir: path.join(__dirname, 'views/partials'),
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

// Use routes
app.use('/', indexRoute);
app.use('/', loginRoute);
app.use('/', registerRoute);
app.use('/', logoutRoute);
app.use('/', dashboardRoute);
app.use('/', profileRoute);

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});