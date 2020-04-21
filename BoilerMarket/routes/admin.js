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

router.get('/', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    return res.redirect('/admin/dashboard');
});

router.get('/dashboard', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, users, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.end();
        return res.render('platform/admin/dashboard.hbs', {
            error: req.flash('error'),
            success: req.flash('success'),
            page_name: 'Admin Dashboard',
            user_email: users[0].email,
            user_phone_number: users[0].phone_number,
            user_location: users[0].location,
            user_first_name: users[0].first_name,
            user_last_name: users[0].last_name,
            user_two_factor: users[0].two_factor,
        });
    });
});

router.get('/users', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, currentUser, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT * FROM users;`, (errorGettingUsers, users, fields) => {
            if (errorGettingUsers) {
                console.log(errorGettingUsers);
                con.end();
                req.flash('error', 'Error.');
                return res.redirect('/admin/dashboard');
            }
            con.end();
            return res.render('platform/admin/users.hbs', {
                error: req.flash('error'),
                success: req.flash('success'),
                page_name: 'Users',
                user_email: currentUser[0].email,
                user_phone_number: currentUser[0].phone_number,
                user_location: currentUser[0].location,
                user_first_name: currentUser[0].first_name,
                user_last_name: currentUser[0].last_name,
                user_two_factor: currentUser[0].two_factor,
                users: users,
            });
        });
    });
});

router.get('/view-user/:user_id', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, currentUser, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.params.user_id)};`, (errorGettingUsers, user, fields) => {
            if (errorGettingUsers) {
                console.log(errorGettingUsers);
                con.end();
                req.flash('error', 'Error.');
                return res.redirect('/admin/dashboard');
            }
            if (user.length === 0) {
                con.end();
                req.flash('error', 'User not found.');
                return res.redirect('/admin/users');
            }
            con.end();
            return res.render('platform/admin/view-user.hbs', {
                error: req.flash('error'),
                success: req.flash('success'),
                page_name: 'View User',
                user_email: currentUser[0].email,
                user_phone_number: currentUser[0].phone_number,
                user_location: currentUser[0].location,
                user_first_name: currentUser[0].first_name,
                user_last_name: currentUser[0].last_name,
                user_two_factor: currentUser[0].two_factor,
                user: user[0],
            });
        });
    });
});

router.post(`/edit-user/:user_id`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    req.checkBody('first_name', 'First name is required.').notEmpty();
    req.checkBody('last_name', 'Last name is required.').notEmpty();
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('phone_number', 'Phone number is required.').notEmpty();
    req.checkBody('location', 'Location is required.').notEmpty();
    req.checkBody('two_factor', 'Two factor selection is required.').notEmpty();
    req.checkBody('admin', 'Admin selection is required.').notEmpty();
    let formErrors = req.validationErrors();
    if (formErrors) {
        req.flash('error', formErrors[0].msg);
        return res.redirect(`/admin/view-user/${req.params.user_id}`);
    }
    var regex = /^1[0-9]{3}[0-9]{3}[0-9]{4}$/g;
    var resultCheckingPhoneNumber = (req.body.phone_number).match(regex);
    if (!resultCheckingPhoneNumber) {
        req.flash('error', 'Wrong phone number format (1XXXXXXXXXX).');
        return res.redirect(`/admin/view-user/${req.params.user_id}`);
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`UPDATE users SET first_name=${mysql.escape(req.body.first_name)}, last_name=${mysql.escape(req.body.last_name)}, email=${mysql.escape(req.body.email)}, phone_number=${mysql.escape(req.body.phone_number)}, location=${mysql.escape(Number(req.body.location))}, two_factor=${mysql.escape(Number(req.body.two_factor))}, admin=${mysql.escape(Number(req.body.admin))} WHERE id=${mysql.escape(req.params.user_id)};`, (errorUpdatingUser, updateUserResult, fields) => {
        if (errorUpdatingUser) {
            console.log(errorUpdatingUser);
            con.end();
            req.flash('error', 'Error updating user.');
            return res.redirect(`/admin/view-user/${req.params.user_id}`);
        }
        con.end();
        req.flash('success', 'Successfully updated user.');
        return res.redirect(`/admin/view-user/${req.params.user_id}`);
    });
});

router.post(`/change-user-password/:user_id`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    req.checkBody('new_password', 'New password is required.').notEmpty();
    req.checkBody('confirm_password', 'Confirm password is required.').notEmpty();
    req.checkBody('confirm_password', 'Password does not match confirmation password field.').equals(req.body.new_password);
    let formErrors = req.validationErrors();
    if (formErrors) {
        req.flash('error', formErrors[0].msg);
        return res.redirect(`/admin/view-user/${req.params.user_id}`);
    }
    let salt = bcrypt.genSaltSync(10);
    let hashedPassword = bcrypt.hashSync(req.body.new_password, salt);
    let con = mysql.createConnection(dbInfo);
    con.query(`UPDATE users SET password=${mysql.escape(hashedPassword)} WHERE id=${mysql.escape(req.params.user_id)};`, (errorUpdatingUser, updateUserResult, fields) => {
        if (errorUpdatingUser) {
            console.log(errorUpdatingUser);
            con.end();
            req.flash('error', 'Error updating user password.');
            return res.redirect(`/admin/view-user/${req.params.user_id}`);
        }
        con.end();
        req.flash('success', 'Successfully updated password.');
        return res.redirect(`/admin/view-user/${req.params.user_id}`);
    });
});

router.get('/transactions', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT transactions.id, transactions.status, listings.title, listings.description, listings.price, listings.listing_type, transactions.date, transactions.buyer, transactions.seller FROM transactions JOIN listings ON transactions.listing_id = listings.id;`, (errorGettingTransactions, transactions, fields) => {
        if (errorGettingTransactions) {
            console.log(errorGettingTransactions);
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/admin/dashboard');
        }
        console.log(transactions)

        con.end();
        return res.render('platform/admin/users.hbs', {
            error: req.flash('error'),
            success: req.flash('success'),
            page_name: 'BoilerMarket Transactions',
            transactions: transactions,
        });
    });
});

router.get(`/transactions/view/:id`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/transactions');
    }
    con.query(`SELECT transactions.buyer_cancel, transactions.seller_cancel, transactions.status as 'transaction_status', transactions.id as 'transaction_id', listings.id as 'listing_id', transactions.date as 'transaction_date', listings.price as 'transaction_price', listings.title as 'listing_title', listings.description as 'listing_description', listings.listing_type, listings.duration as 'rent_duration', transactions.buyer as 'transaction_buyer', transactions.seller as 'transaction_seller' FROM transactions JOIN listings ON transactions.listing_id = listings.id WHERE transactions.id=${mysql.escape(req.params.id)};`, (errorFindingTransaction, transaction, fields) => {
      if (errorFindingTransaction) {
        console.log(errorFindingTransaction);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/transactions');
      }
      if (transaction.length === 0) {
        con.end();
        req.flash('error', 'Error. Transaction not found.');
        return res.redirect('/transactions');
      }
      con.end();
      
      /* Show 'Mark as Complete' Button Logic */
      isBuyer = (req.user.id === transaction[0].transaction_buyer)
      isPending = (transaction[0].transaction_status === 4)
      isNotCanceled = (transaction[0].buyer_cancel === 0 && transaction[0].seller_cancel === 0)
      showCompleteButton = isBuyer && isPending && isNotCanceled
      /* END - Show 'Mark as Complete' Button Logic */

      /* Show 'Cancel' Button Logic */
      cancelButtonSellerCase = transaction[0].seller_cancel !== 1 && req.user.id === transaction[0].transaction_seller
      cancelButtonBuyerCase = transaction[0].buyer_cancel !== 1 && req.user.id === transaction[0].transaction_buyer
      isTransactionNotComplete = transaction[0].transaction_status === 4
      showCancelButton = isTransactionNotComplete && (cancelButtonSellerCase || cancelButtonBuyerCase)
      /* END - Show 'Cancel' Button Logic */

      /* Show 'Dispute' Button Logic */
      showDisputeButton = isTransactionNotComplete && isBuyer && (transaction[0].buyer_cancel === 0 || isNotCanceled);
      /* END - Show 'Dispute' Button Logic */

      /* Show Cancel Message Alert */
      let showCancelMessage = null;
      if (transaction[0].transaction_status === 3) {
        showCancelMessage = "This transaction has been cancelled.";
      } else {
        if (transaction[0].buyer_cancel === 1) {
          if (req.user.id === transaction[0].transaction_buyer) {
            showCancelMessage = "You've requested to cancel the transaction. Awaiting seller response.";
          } else {
            showCancelMessage = "Buyer requested to cancel the transaction. Awaiting your response.";
          }
        } else if (transaction[0].seller_cancel === 1) {
          if (req.user.id === transaction[0].transaction_seller) {
            showCancelMessage = "You've requested to cancel the transaction. Awaiting buyer response.";
          } else {
            showCancelMessage = "Seller requested to cancel the transaction. Awaiting your response.";
          }
        }
      }
      /* END - Show Cancel Message Alert */

      /* Obtain chatCurrentUser & chatRecipient values */
      let chatCurrentUser = req.user.id;
      let chatRecipientUser = 0;
      if (transaction[0].transaction_buyer !== req.user.id) chatRecipientUser = transaction[0].transaction_buyer;
      else chatRecipientUser = transaction[0].transaction_seller;
      /* END - Obtain BuyerID & Seller ID */
      return res.render('platform/view-transaction.hbs', {
        page_name: 'View Transaction',
        user_first_name: currentUser[0].first_name,
        user_last_name: currentUser[0].last_name,
        user_email: currentUser[0].email,
        user_is_admin: req.user.is_admin,
        error: req.flash('error'),
        success: req.flash('success'),
        transaction: transaction[0],
        showCancelMessage: showCancelMessage,
        showCompleteButton: showCompleteButton,
        showCancelButton: showCancelButton,
        showDisputeButton: showDisputeButton,
        chatCurrentUser: chatCurrentUser,
        chatRecipientUser: chatRecipientUser,
      });
    });
  });
});





module.exports = router;