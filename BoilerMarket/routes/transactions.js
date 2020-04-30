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
const cron = require("node-cron");

const LocalStrategy = require('passport-local').Strategy;
const AuthenticationFunctions = require('../Functions/Authentication.js');
const TransactionFunctions = require('../Functions/Transactions.js');

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
        user_is_admin: req.user.is_admin,
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
            return res.redirect(`/transactions/view/${req.params.id}`);
          }
          con.query(`UPDATE listings SET status=3 WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdateListing, updateListingResult, fields) => {
            if (errorUpdateListing) {
              console.log(errorUpdateListing);
              con.end();
              req.flash('error', 'Error updating listing.');
              return res.redirect(`/transactions/view/${req.params.id}`);
            }
            TransactionFunctions.email_cancelTransaction(transaction[0].buyer, transaction[0].listing_id);
            TransactionFunctions.email_cancelTransaction(transaction[0].seller, transaction[0].listing_id);
            req.flash(`success`, `Transaction has been cancelled.`)
            con.end();
            return res.redirect(`/transactions/view/${req.params.id}`);
          });
        });
      } else {
        con.query(`UPDATE transactions SET buyer_cancel=${buyerCancel}, seller_cancel=${sellerCancel} WHERE id=${mysql.escape(req.params.id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
          if (errorUpdateTransaction) {
            console.log(errorUpdateTransaction);
            con.end();
            req.flash('error', 'Error updating transaction.');
            return res.redirect(`/transactions/view/${req.params.id}`);
          }
          con.end();
          return res.redirect(`/transactions/view/${req.params.id}`);
        });
      }
    });
  });
});

router.post(`/transactions/complete`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM transactions WHERE id=${mysql.escape(req.body.transaction_id)} AND buyer = ${mysql.escape(req.user.id)};`, (errorFindingTransaction, transaction, fields) => {
    if (errorFindingTransaction) {
      console.log(errorFindingTransaction);
      con.end();
      req.flash('error', 'Error finding transaction.');
      return res.redirect('/transactions');
    }
    if (transaction.length === 0) {
      con.end();
      req.flash('error', 'Error. Transaction not found.');
      return res.redirect('/transactions');
    }
    if (transaction[0].seller_cancel === 1 || transaction[0].buyer_cancel === 1) {
      con.end();
      req.flash('error', 'Error. The transaction was requested to be canceled, therefore it is not able to be completed.');
      return res.redirect(`/transactions/view/${transaction[0].id}`);
    }

    con.query(`SELECT * FROM listings WHERE id='${transaction[0].listing_id}';`, (errorFindingListing, listing, fields) => {
      if (errorFindingListing) {
        console.log(errorFindingListing);
        con.end();
        req.flash('error', 'Error finding listing.');
        return res.redirect('/transactions');
      }
      if (listing.length !== 1) {
        con.end();
        req.flash('error', 'Error. Listing not found.');
        return res.redirect('/transactions');
      }
      
      newStatus = listing[0].listing_type

      con.query(`UPDATE transactions SET status=${newStatus}, seller_rating=${mysql.escape(Number(req.body.seller_rating))}, buyer_cancel=0 WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
        if (errorUpdateTransaction) {
          console.log(errorUpdateTransaction);
          con.end();
          req.flash('error', 'Error updating transaction.');
          return res.redirect('/transactions');
        }
        con.query(`UPDATE listings SET status=${newStatus} WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdateListing, updateListingResult, fields) => {
          if(errorUpdateListing) {
            console.log(errorUpdateListing);
            con.end();
            req.flash('error', 'Error updating listing.');
            return res.redirect('/transactions');
          }
          TransactionFunctions.set_complete_date_for_transaction(req.body.transaction_id);
          TransactionFunctions.email_completeTransaction(transaction[0].buyer, listing[0].title);
          TransactionFunctions.email_completeTransaction(transaction[0].seller, listing[0].title);
          req.flash(`success`, `Transaction completed.`)
          con.end();
          return res.redirect(`/transactions`);
        });
      });
    });
  });
});

router.post(`/transactions/open-dispute`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  req.checkBody('seller_rating', 'Seller rating is required.').notEmpty();
  req.checkBody('dispute_reason', 'Dispute reason is required.').notEmpty();
  let formErrors = req.validationErrors();
  if (formErrors) {
    req.flash('error', formErrors[0].msg);
    return res.redirect(`/transactions/view/${req.body.transaction_id}`);
  }
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM transactions WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorFindingTransaction, transaction, fields) => {
    if (errorFindingTransaction) {
      console.log(errorFindingTransaction);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect(`/transactions/view/${req.body.transaction_id}`);
    }
    if (transaction.length !== 0) {
      if (transaction[0].status === 3) {
        con.end();
        req.flash('error', 'Error. Transaction cannot be escalated to a dispute as it has been cancelled.');
        return res.redirect(`/transactions/view/${req.body.transaction_id}`);
      } else if (transaction[0].status === 1 || transaction[0].status === 2) {
        con.end();
        req.flash('error', 'Error. Transaction cannot be escalated to a dispute as it has been completed.');
        return res.redirect(`/transactions/view/${req.body.transaction_id}`);
      }
      con.query(`INSERT INTO disputes (id, transaction_id, reason, status) VALUES (${mysql.escape(uuidv4())}, ${mysql.escape(req.body.transaction_id)}, ${mysql.escape(req.body.dispute_reason)}, 0);`, (errorInsertingDispute, insertDisputeResult, fields) => {
        if (errorInsertingDispute) {
          console.log(errorInsertingDispute);
          con.end();
          req.flash('error', 'Error.');
          return res.redirect(`/transactions/view/${req.body.transaction_id}`);
        }
        con.query(`UPDATE transactions SET status=5, seller_rating=${mysql.escape(Number(req.body.seller_rating))} WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorUpdatingTransaction, updateTransactionResult, fields) => {
          if (errorUpdatingTransaction) {
            console.log(errorUpdatingTransaction);
            con.end();
            req.flash('error', 'Error.');
            return res.redirect(`/transactions/view/${req.body.transaction_id}`);
          }
          con.query(`UPDATE listings SET status=5 WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdatingListing, updateListingResult, fields) => {
            if (errorUpdatingListing) {
              console.log(errorUpdatingListing);
              con.end();
              req.flash('error', 'Error.');
              return res.redirect(`/transactions/view/${req.body.transaction_id}`);
            }
            TransactionFunctions.email_openDispute(transaction[0].buyer, transaction[0]);
            TransactionFunctions.email_openDispute(transaction[0].seller, transaction[0]);
            con.end();
            req.flash('success', 'Escalated to a dispute.');
            return res.redirect(`/transactions/view/${req.body.transaction_id}`);
          });
        });
      });
    } else {
      con.end();
      req.flash('error', 'Error. Transaction not found.');
      return res.redirect(`/transactions/view/${req.body.transaction_id}`);
    }
  });
});


cron.schedule("* * 1 * * *", function() {
  console.log("---------------------");
  console.log("Running Cron Job");
  TransactionFunctions.check_rental_periods();
  console.log("---------------------");
  
});

module.exports = router;