const express = require('express');
const _ = require('lodash');
const session = require('express-session');
const expressValidator = require('express-validator');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const uuidv4 = require('uuid/v4');
var passport = require("passport");
var request = require("request");
const mysql = require('mysql');
const moment = require('moment');
const nodemailer = require('nodemailer');

const LocalStrategy = require('passport-local').Strategy;
const AuthenticationFunctions = require('../Functions/Authentication.js');

let dbInfo = {
    connectionLimit: 100,
    host: '34.68.115.37',
    user: 'root1',
    password: 'BoilerMarket1234!',
    database: 'boilermarket',
    port: 3306,
    multipleStatements: true
};

router.get('/listings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  return res.render('platform/listings.hbs', {
    error: req.flash('error'),
    success: req.flash('success'),
    page_name: 'BoilerMarket Listings'
  });
});

router.get('/listings/create-listing', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/dashboard');
    }
    con.end();
    return res.render('platform/create-a-listing.hbs', {
      page_name: 'Create a Listing',
      user_first_name: currentUser[0].first_name,
      user_last_name: currentUser[0].last_name,
      user_email: currentUser[0].email,
    });
  });
});

module.exports = router;