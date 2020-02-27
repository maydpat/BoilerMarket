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

router.get('/transactions', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/dashboard');
    }
    con.query(`SELECT transactions.id, transactions.status, listings.title, listings.description, listings.price, listings.listing_type, transactions.date, transactions.buyer, transactions.seller FROM transactions JOIN listings ON transactions.listing_id = listings.id WHERE transactions.buyer = ${mysql.escape(req.user.id)} OR transactions.seller = ${mysql.escape(req.user.id)};`, (errorFindingTransactions, transactions, fields) => {
      if (errorFindingTransactions) {
        console.log(errorFindingTransactions);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/dashboard');
      }
      con.end();
      return res.render('platform/transactions.hbs', {
        page_name: 'Your Transactions',
        error: req.flash('error'),
        success: req.flash('success'),
        user_first_name: currentUser[0].first_name,
        user_last_name: currentUser[0].last_name,
        user_email: currentUser[0].email,
        transactions: transactions,
      });
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
      return res.render('platform/view-transaction.hbs', {
        page_name: 'View Transaction',
        user_first_name: currentUser[0].first_name,
        user_last_name: currentUser[0].last_name,
        user_email: currentUser[0].email,
        error: req.flash('error'),
        success: req.flash('success'),
        transaction: transaction[0],
        showCancelMessage: showCancelMessage,
      });
    });
  });
});

router.get(`/transactions/cancel/:id`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/transactions');
    }
    con.query(`SELECT * FROM transactions WHERE id=${mysql.escape(req.params.id)} AND (buyer = ${mysql.escape(req.user.id)} OR seller = ${mysql.escape(req.user.id)});`, (errorFindingTransaction, transaction, fields) => {
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
      let buyerCancel = transaction[0].buyer_cancel;
      let sellerCancel = transaction[0].seller_cancel;
      if (buyerCancel === 1 && sellerCancel === 1) {
        con.end();
        req.flash('error', 'Error. Transaction is already cancelled.');
        return res.redirect(`/transactions/view/${req.params.id}`);
      }
      if (transaction[0].buyer === req.user.id) {
        if (transaction[0].buyer_cancel === 1) {
          con.end();
          req.flash('error', 'Error. You have already requrested to cancel the transaction. Please wait on seller.');
          return res.redirect(`/transactions/view/${req.params.id}`);
        } else {
          buyerCancel = 1;
        }
      } else {
        if (transaction[0].seller_cancel === 1) {
          con.end();
          req.flash('error', 'Error. You have already requrested to cancel the transaction. Please wait on buyer.');
          return res.redirect(`/transactions/view/${req.params.id}`);
        } else {
          sellerCancel = 1;
        }
      }
      if (buyerCancel === 1 && sellerCancel === 1) {
        con.query(`UPDATE transactions SET buyer_cancel=${buyerCancel}, seller_cancel=${sellerCancel}, status=3 WHERE id=${mysql.escape(req.params.id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
          if (errorUpdateTransaction) {
            console.log(errorUpdateTransaction);
            con.end();
            req.flash('error', 'Error updating transaction.');
            return res.redirect('/transactions');
          }
          req.flash(`success`, `Transaction has been cancelled.`)
          con.end();
          return res.redirect(`/transactions`);
        });
      } else {
        con.query(`UPDATE transactions SET buyer_cancel=${buyerCancel}, seller_cancel=${sellerCancel} WHERE id=${mysql.escape(req.params.id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
          if (errorUpdateTransaction) {
            console.log(errorUpdateTransaction);
            con.end();
            req.flash('error', 'Error updating transaction.');
            return res.redirect('/transactions');
          }
          con.end();
          console.log(req.params.id);
          return res.redirect(`/transactions/view/${req.params.id}`);
        });
      }
    });
  });
});

module.exports = router;