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
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/dashboard');
    }
    con.query(`SELECT * FROM listings WHERE status=0 AND listing_owner!=${mysql.escape(req.user.id)};`, (obtainListingsError, listings, fields) => {
      if (obtainListingsError) {
        console.log(obtainListingsError);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/dashboard');
      }
      con.end();
      return res.render('platform/listings.hbs', {
        page_name: 'BoilerMarket Listings',
        error: req.flash('error'),
        success: req.flash('success'),
        user_first_name: currentUser[0].first_name,
        user_last_name: currentUser[0].last_name,
        user_email: currentUser[0].email,
        listings: listings
      });
    });
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
      error: req.flash('error'),
      success: req.flash('success'),
    });
  });
});

router.post('/listings/create-listing', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('listing_title', 'Title field is required.').notEmpty();
  req.checkBody('listing_description', 'Description field is required.').notEmpty();
  req.checkBody('listing_price', 'Price field is required.').notEmpty();
  req.checkBody('listing_type', 'Listing Type field is required.').notEmpty();
  let formErrors = req.validationErrors();
  if (formErrors) {
      req.flash('error', formErrors[0].msg);
      return res.redirect('/listings');
  }
  let con = mysql.createConnection(dbInfo);
  let newID = uuidv4();
  con.query(`INSERT INTO listings (id, title, description, price, listing_type, listing_owner) VALUES (${mysql.escape(newID)}, ${mysql.escape(req.body.listing_title)}, ${mysql.escape(req.body.listing_description)}, ${mysql.escape(Number(req.body.listing_price))}, ${mysql.escape(Number(req.body.listing_type))}, ${mysql.escape(req.user.id)});`, (insertListingError, insertListingResult, fields) => {
    if (insertListingError) {
      console.log(insertListingError);
      con.end();
      req.flash('error', 'Error creating listing.');
      return res.redirect('/listings/create-listing');
    }
    if (req.body.listing_type == 2) {
      con.query(`UPDATE listings SET duration=${mysql.escape(Number(req.body.rent_duration))} WHERE id=${mysql.escape(newID)};`, (setListingDurationError, setDurationResult, fields) => {
        if (setListingDurationError) {
          console.log(setListingDurationError);
          con.end();
          req.flash('error', 'Error setting rental duration.');
          return res.redirect('/listings/create-listing');
        }
        con.end();
        req.flash('success', 'Successfully created listing.');
        return res.redirect('/listings/my-listings');
      });
    } else {
      con.end();
      req.flash('success', 'Successfully created listing.');
      return res.redirect('/listings/my-listings');
    }
  });
});

router.get('/listings/my-listings', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/dashboard');
    }
    con.query(`SELECT * FROM listings WHERE listing_owner=${mysql.escape(req.user.id)};`, (errorFindingListings, userListings, fields) => {
      if (errorFindingListings) {
        console.log(errorFindingListings);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/dashboard');
      }
      con.end();
      return res.render('platform/my-listings.hbs', {
        page_name: 'My Product Listings',
        user_first_name: currentUser[0].first_name,
        user_last_name: currentUser[0].last_name,
        user_email: currentUser[0].email,
        error: req.flash('error'),
        success: req.flash('success'),
        userListings: userListings,
      });
    });
  });
});

router.get(`/listings/edit/:id`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/listings/my-listings');
    }
    con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.id)};`, (errorFindingListings, listings, fields) => {
      if (errorFindingListings) {
        console.log(errorFindingListings);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/listings/my-listings');
      }
      if (listings.length === 0) {
        con.end();
        req.flash('error', 'Error. Listing not found.');
        return res.redirect('/listings/my-listings');
      } else if (listings[0].status === 1) {
        con.end();
        req.flash('error', 'Error. Transaction is on-going. Listing cannot be edited.');
        return res.redirect('/listings/my-listings');
      } else {
        con.end();
        console.log(listings);
        return res.render('platform/edit-my-listing.hbs', {
          page_name: 'Edit Product Listing',
          user_first_name: currentUser[0].first_name,
          user_last_name: currentUser[0].last_name,
          user_email: currentUser[0].email,
          error: req.flash('error'),
          success: req.flash('success'),
          listing: listings[0],
        });
      }
    });
  });
});

router.post(`/listings/edit/:id`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('listing_title', 'Title field is required.').notEmpty();
  req.checkBody('listing_description', 'Description field is required.').notEmpty();
  req.checkBody('listing_price', 'Price field is required.').notEmpty();
  req.checkBody('listing_type', 'Listing Type field is required.').notEmpty();
  let formErrors = req.validationErrors();
  if (formErrors) {
      req.flash('error', formErrors[0].msg);
      return res.redirect(`/listings/edit/${req.params.id}`);
  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.id)};`, (errorFindingListings, listings, fields) => {
    if (errorFindingListings) {
      console.log(errorFindingListings);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/listings/my-listings');
    }
    if (listings.length === 0) {
      con.end();
      req.flash('error', 'Error. Listing not found.');
      return res.redirect('/listings/my-listings');
    } else if (listings[0].status === 1) {
      con.end();
      req.flash('error', 'Error. Transaction is on-going. Listing cannot be edited.');
      return res.redirect('/listings/my-listings');
    } else {
      con.query(`UPDATE listings SET title=${mysql.escape(req.body.listing_title)}, description=${mysql.escape(req.body.listing_description)}, price=${mysql.escape(Number(req.body.listing_price))}, listing_type=${mysql.escape(Number(req.body.listing_type))} WHERE id=${mysql.escape(req.params.id)};`, (updateListingError, updateListingResult, fields) => {
        if (updateListingError) {
          console.log(updateListingError);
          con.end();
          req.flash('error', 'Error updating listing.');
          return res.redirect(`/listings/edit/${req.params.id}`);
        }
        con.end();
        req.flash('success', 'Successfully updated listing.');
        return res.redirect('/listings/my-listings');
      });
    }
  });
});

router.get('/listings/view/:id', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/listings/my-listings');
    }
    con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.id)};`, (errorFindingListings, listings, fields) => {
      if (errorFindingListings) {
        console.log(errorFindingListings);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/listings/my-listings');
      }
      if (listings.length === 0) {
        con.end();
        req.flash('error', 'Error. Listing not found.');
        return res.redirect('/listings/my-listings');
      } else {
        con.end();
        return res.render('platform/view-listing.hbs', {
          page_name: 'View Listing',
          user_first_name: currentUser[0].first_name,
          user_last_name: currentUser[0].last_name,
          user_email: currentUser[0].email,
          error: req.flash('error'),
          success: req.flash('success'),
          listing: listings[0],
        });
      }
    });
  });
});

module.exports = router;