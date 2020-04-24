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
let enable2FA = 0;

router.get('/login', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
    return res.render('platform/login.hbs', {
      error: req.flash('error'),
      success: req.flash('success')
    });
});

router.post('/login', AuthenticationFunctions.ensureNotAuthenticated, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE email=${mysql.escape(req.body.username)};`, (error, results, fields) => {
        if (error) {
            console.log(error.stack);
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/login');
        }
        if (results.length === 0) {
            con.end();
            req.flash('error', 'Email or Password is incorrect.');
            return res.redirect('/login');
        } else if (results[0].ban) {
            con.end();
            req.flash('error', 'You have been banned from BoilerMarket.');
            return res.redirect('/login');
        } else {
            if (bcrypt.compareSync(req.body.password, results[0].password)) {
                con.end();
                if (enable2FA === 1 && results[0].two_factor === 1) {
                    nexmo.verify.request({
                        number: results[0].phone_number,
                        brand: "BoilerMarket"
                    }, (err, result) => {
                        if (err) {
                            console.error(err);
                            req.flash('error', '2FA Send Error.');
                            return res.redirect('/login');
                        } else {
                        const verifyRequestId = result.request_id;
                        console.log('request_id', verifyRequestId);
                        return res.render('platform/login-two-factor.hbs', {
                            token: verifyRequestId,
                            username: results[0].email,
                            password: req.body.password,
                            twofactor: 1,
                        });
                        }
                    });  
                } else {
                    return res.render('platform/login-two-factor.hbs', {
                        token: 0123,
                        username: results[0].email,
                        password: req.body.password,
                        twofactor: 0,
                    });
                } 
            } else {
                con.end();
                req.flash('error', 'Email or Password is incorrect.');
                return res.redirect('/login');
            }
        }
    });
});

router.post('/login-two-factor-auth', AuthenticationFunctions.ensureNotAuthenticated, passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }), (req, res) => {
    res.redirect('/dashboard');
});

passport.use(new LocalStrategy({ passReqToCallback: true, },
async function (req, username, password, done) {
    if (enable2FA === 1 && Number(req.body.twofactor) === 1) {
        nexmo.verify.check({
            request_id: req.body.token,
            code: req.body.sms_token
        }, (verifyErr, verifyResult) => {
            if (verifyErr) {
                console.error(verifyErr);
                return done(null, false, req.flash('error', '2FA Verification Error.'));
            } else {
                console.log(verifyResult);
                if (verifyResult.status === '16' || verifyResult.error_text === 'The code provided does not match the expected value') {
                    nexmo.verify.control({
                        request_id: req.body.token,
                        cmd: 'cancel'
                      }, (cancelErr, cancelResult) => {
                        if (cancelErr) {
                          console.error(cancelErr);
                        } else {
                          console.log(cancelResult);
                          return done(null, false, req.flash('error', 'The code provided does not match the expected value.'));
                        }
                      });                  
                } else {
                    let con = mysql.createConnection(dbInfo);
                    con.query(`SELECT * FROM users WHERE email=${mysql.escape(req.body.username)};`, (error, users, fields) => {
                        if (error) {
                            console.log(error);
                            con.end();
                            return done(null, false, req.flash('error', 'Error.'));
                        } else {
                            con.end();
                            let userObj = {
                                email: users[0].email,
                                first_name: users[0].first_name,
                                last_name: users[0].last_name,
                                phone_number: users[0].phone_number,
                                location: users[0].location,
                                id: users[0].id,
                                is_admin: users[0].admin,
                            };
                            return done(null, userObj);
                        }
                    });
                }
            }
        });
    } else {
        let con = mysql.createConnection(dbInfo);
        con.query(`SELECT * FROM users WHERE email=${mysql.escape(req.body.username)};`, (error, users, fields) => {
            if (error) {
                console.log(error);
                con.end();
                return done(null, false, req.flash('error', 'Error.'));
            } else {
                con.end();
                let userObj = {
                    email: users[0].email,
                    first_name: users[0].first_name,
                    last_name: users[0].last_name,
                    phone_number: users[0].phone_number,
                    location: users[0].location,
                    id: users[0].id,
                    is_admin: users[0].admin,
                };
                return done(null, userObj);
            }
        });
    }
      
}));
  
passport.serializeUser(function (uuid, done) {
    done(null, uuid);
});

passport.deserializeUser(function (uuid, done) {
    done(null, uuid);
});


module.exports = router;