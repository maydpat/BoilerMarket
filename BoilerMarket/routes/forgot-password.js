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

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "purdueboilermarket@gmail.com",
    pass: "BoilerMarket1234!"
  }
});

router.get('/forgot-password', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
    return res.render('platform/forgot-password.hbs', {
      error: req.flash('error'),
      success: req.flash('success')
    });
});

router.post('/forgot-password', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
    req.flash('success', "If your email exists in BoilerMarket, you will receive an email to reset your password.");
    res.redirect('/login');

    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE email=${mysql.escape(req.body.userEmail)};`, (error, results, fields) => {
      if (error) {
        console.log(error.stack);
        con.end();
        return;
      }
      if (results.length === 1) {
        let randomID = uuidv4();
        console.log(req.body.userEmail);
        con.query(`UPDATE users SET forgot_password='${randomID}' WHERE email=${mysql.escape(req.body.userEmail)};`, (error, resultsUpdate, fields) => {
          if (error) {
            console.log(error.stack);
            con.end();
            return;
          }

          let passwordResetURL = `http://34.68.115.37/reset-password/${randomID}`;
          let emailContent = `<p>Hello ${results[0].first_name},<br><br>Here is the link to reset your password: ${passwordResetURL}</p><p><br><br>Boiler Up!<br>The BoilerMarket Team</p>`;
          const mailOptions = {
            from: 'purdueboilermarket@gmail.com',
            to: results[0].email,
            subject: 'BoilerMarket Password Reset',
            html: emailContent
          };

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log(info);
            }
          });
          con.end();
        });
      } else {
        con.end();
      }
    });
});

router.get('/reset-password/:resetPasswordID', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE forgot_password=${mysql.escape(req.params.resetPasswordID)};`, (error, results, fields) => {
    if (error) {
      console.log(error.stack);
      con.end();
      return;
    }
    if (results.length === 0) {
      req.flash('error', 'Error.');
      con.end();
      return res.redirect('/login');
    } else if (results.length === 1) {
      con.end();
      return res.render('platform/reset-password.hbs', {
        resetPasswordID: req.params.resetPasswordID,
        email: results[0].email,
        error: req.flash('error'),
      });
    } else {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/login');
    }
  });
});

router.post('/reset-password/:resetPasswordID', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
  req.checkBody('new_password', 'New Password is required').notEmpty();
  req.checkBody('confirm_password', 'Confirm New Password is required.').notEmpty();
  req.checkBody('new_password', 'Passwords do not match.').equals(req.body.confirm_password);
  let formErrors = req.validationErrors();
  if (formErrors) {
      req.flash('error', formErrors[0].msg);
      return res.redirect('/profile');
  }
  if (formErrors) {
    req.flash('error', formErrors[0].msg);
    return res.redirect(`/reset-password/${req.params.resetPasswordID}`);
  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE forgot_password=${mysql.escape(req.params.resetPasswordID)};`, (error, results, fields) => {
    if (error) {
      console.log(error.stack);
      con.end();
      return;
    }
    if (results.length === 0) {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/login');
    } else if (results.length === 1) {
      let salt = bcrypt.genSaltSync(10);
      let hashedPassword = bcrypt.hashSync(req.body.new_password, salt);
      con.query(`UPDATE users SET password='${hashedPassword}', forgot_password='' WHERE forgot_password=${mysql.escape(req.params.resetPasswordID)};`, (error, results, fields) => {
        if (error) {
          console.log(error.stack);
          con.end();
          return;
        }
        con.end();
        req.flash('success', 'Password successfully changed. You may now login.');
        return res.redirect('/login');
      });
    } else {
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/login');
    }
  });
});

module.exports = router;