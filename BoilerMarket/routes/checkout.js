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

router.get('/checkout/:listing_id', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/cart');
    }
    con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.listing_id)};`, (errorFindingListings, listings, fields) => {
        if (errorFindingListings) {
            console.log(errorFindingListings);
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/cart');
        }
        if (listings.length === 0) {
            con.end();
            req.flash('error', 'Error. Listing not found.');
            return res.redirect('/cart');
        } else {
            con.end();
            return res.render('platform/checkout.hbs', {
            page_name: 'Checkout',
            user_first_name: currentUser[0].first_name,
            user_last_name: currentUser[0].last_name,
            user_email: currentUser[0].email,
            user_is_admin: req.user.is_admin,
            error: req.flash('error'),
            success: req.flash('success'),
            listing: listings[0],
            });
        }
    });
  });
});

router.get(`/checkout/transact/:id`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM cart JOIN listings ON cart.listing_id = listings.id WHERE cart.listing_id=${mysql.escape(req.params.id)} AND buyer=${mysql.escape(req.user.id)};`, (errorFindingCartListing, cartListings, fields) => {
    if (errorFindingCartListing) {
      console.log(errorFindingCartListing);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/cart');
    }
    if (cartListings.length === 0) {
      con.end();
      req.flash('error', 'Error finding the listing in your cart.');
      return res.redirect('/cart');
    } else {
      con.query(`DELETE FROM cart WHERE listing_id=${mysql.escape(req.params.id)};`, (errorRemovingListing, deleteListingFromCartsResult, fields) => {
        if (errorRemovingListing) {
          console.log(errorRemovingListing);
          con.end();
          req.flash('error', 'Error.');
          return res.redirect('/cart');
        }
        let updateType = 4;
        let transactionID = uuidv4();
        con.query(`INSERT INTO transactions (id, listing_id, buyer, seller, status) VALUES (${mysql.escape(transactionID)}, ${mysql.escape(req.params.id)}, ${mysql.escape(cartListings[0].buyer)}, ${mysql.escape(cartListings[0].seller)}, ${updateType});`, (errorCreatingTransaction, createTransactionResult, fields) => {
          if (errorCreatingTransaction) {
            console.log(errorCreatingTransaction);
            con.end();
            req.flash('error', "Error.");
            return res.redirect('/cart');
          }
          con.query(`UPDATE listings SET status=${updateType} WHERE id=${mysql.escape(req.params.id)};`, (errorUpdatingListing, updateListingResult, fields) => {
            if (errorUpdatingListing) {
              console.log(errorUpdatingListing);
              con.end();
              req.flash('error', "Error.");
              return res.redirect('/cart');
            }
            req.flash('success', "Transaction Created.");
            con.end();
            return res.redirect(`/transactions/view/${transactionID}`);
          });
        });
      });
    }
  });
});

module.exports = router;