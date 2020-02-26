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

router.get('/cart', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    return res.render('platform/cart.hbs', {
      error: req.flash('error'),
      success: req.flash('success')
    });
});

router.get(`/cart/add/:id`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.id)};`, (errorFindingListings, listings, fields) => {
    if (errorFindingListings) {
      console.log(errorFindingListings);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/listings');
    }
    if (listings.length === 0) {
      con.end();
      req.flash('error', 'Error. Listing not found.');
      return res.redirect('/listings');
    } else if (listings[0].status === 1) {
      con.end();
      req.flash('error', 'Error. Listing cannot be added to cart as it is in a transaction.');
      return res.redirect('/listings');
    } else if (listings[0].listing_owner === req.user.id) {
      con.end();
      req.flash('error', 'Error. You cannot add your own listing to your cart.');
      return res.redirect('/listings');
    } else {
      con.query(`SELECT * FROM cart WHERE listing_id=${mysql.escape(req.params.id)} AND buyer=${mysql.escape(req.user.id)};`, (errorFindingDuplicate, resultFindingDuplicate, fields) => {
        if (errorFindingDuplicate) {
          console.log(errorFindingDuplicate);
          con.end();
          req.flash('error', 'Error.');
          return res.redirect('/listings');
        }
        if (resultFindingDuplicate.length === 1) {
          con.end();
          req.flash('error', 'Error. This listing is already in your cart.');
          return res.redirect('/listings');
        }
        con.query(`INSERT INTO cart (listing_id, buyer, seller) VALUES (${mysql.escape(req.params.id)}, ${mysql.escape(req.user.id)}, ${mysql.escape(listings[0].listing_owner)});`, (errorInsertingToCart, insertToCartResult, fields) => {
          if (errorInsertingToCart) {
            console.log(errorInsertingToCart);
            con.end();
            req.flash('error', "Error.");
            return res.redirect('/listings');
          }
          con.end();
          req.flash('success', 'Successfully added to your cart.');
          return res.redirect('/listings');
        });
      });
    }
  });
});

module.exports = router;