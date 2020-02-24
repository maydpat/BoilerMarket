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

router.get('/profile', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, users, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.end();
        console.log(users);
        return res.render('platform/profile.hbs', {
            error: req.flash('error'),
            success: req.flash('success'),
            page_name: 'My Profile',
            user_email: users[0].email,
            user_phone_number: users[0].phone_number,
            user_location: users[0].location,
            user_first_name: users[0].first_name,
            user_last_name: users[0].last_name,
        });
    });
});

router.post('/profile/update-profile', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('phone_number', 'Phone Number field is required.').notEmpty();
    req.checkBody('location', 'Location (ZIP) field is required.').notEmpty();
    let formErrors = req.validationErrors();
    if (formErrors) {
        req.flash('error', formErrors[0].msg);
        return res.redirect('/profile');
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`UPDATE users SET phone_number=${mysql.escape(req.body.phone_number)}, location=${mysql.escape(req.body.location)}, email=${mysql.escape(req.body.email)} WHERE id=${mysql.escape(req.user.id)};`, (updateUserError, results, fields) => {
        if (updateUserError) {
            con.end();
            console.log(updateUserError);
            req.flash('error', 'Error updating profile.');
            return res.redirect('/profile');
        }
        con.end();
        req.flash('success', 'Successfully updated profile.');
        return res.redirect('/profile');
    });
});

module.exports = router;