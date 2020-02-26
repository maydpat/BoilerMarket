const express = require('express');
const session = require('express-session');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt= require('bcryptjs');
const uuidv4 = require('uuid/v4');
const passport = require("passport");
const flash = require('connect-flash');
var request = require("request");
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: 'cb030773',
  apiSecret: '7LB11LWNAPX0gODR',
});

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

router.get('/register', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
    return res.render('platform/register.hbs', {
      error: req.flash('error'),
      success: req.flash('success')
    });
});

router.post('/register', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
    req.checkBody('first_name', 'First Name field is required.').notEmpty();
    req.checkBody('last_name', 'Last Name field is required.').notEmpty();
    req.checkBody('phone_number', 'Phone Number field is required.').notEmpty();
    req.checkBody('location', 'Location (ZIP CODE) field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('paypal_email', 'Email field is required.').notEmpty();
    req.checkBody('password', 'Password field is required.').notEmpty();
    req.checkBody('password_confirm', 'Confirm password field is required.').notEmpty();
    req.checkBody('password_confirm', 'Password does not match confirmation password field.').equals(req.body.password);
    let formErrors = req.validationErrors();
    if (formErrors) {
    req.flash('error', formErrors[0].msg);
    return res.redirect('/register');
    }
    if (req.body.password.length < 3 || req.body.password.length > 64) {
    req.flash('error', 'Password must be longer than 3 characters and less than 64 characters.');
    return res.redirect('/register');
    }
    if (req.body.first_name.length < 1 || req.body.first_name.length > 240) {
    req.flash('error', 'First Name field must be less than or equal to 240 characters and is required.');
    return res.redirect('/register');
    }
    if (req.body.last_name.length < 1 || req.body.last_name.length > 240) {
    req.flash('error', 'Last Name field must be less than or equal to 240 characters and is required.');
    return res.redirect('/register');
    }
    if (req.body.email.length < 1 || req.body.email.length > 240) {
    req.flash('error', 'Email field must be less than or equal to 240 characters and is required.');
    return res.redirect('/register');
    }
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(req.body.password, salt);
    let con = mysql.createConnection(dbInfo);
    con.query( `INSERT INTO users (id, email, paypal_email, password, first_name, last_name, phone_number, location) VALUES (${mysql.escape(uuidv4())}, ${mysql.escape(req.body.email)}, ${mysql.escape(req.body.paypal_email)}, ${mysql.escape(hashedPassword)}, ${mysql.escape(req.body.first_name)}, ${mysql.escape(req.body.last_name)}, ${mysql.escape(req.body.phone_number)}, ${mysql.escape(req.body.location)});`, (insertUserError, fields, results) => {
        if (insertUserError) {
            console.log(insertUserError);
            con.end();
            req.flash('error', 'Error registering.');
            return res.redirect('/register');
        }
        con.end();
        req.flash('success', 'Successfully registered.');
        return res.redirect('/login');
    });
});


module.exports = router;