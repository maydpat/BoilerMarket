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
const TransactionFunctions = require('../Functions/Transactions.js');
const DisputeFunctions = require('../Functions/Disputes.js');

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
        con.query(`SELECT * FROM listings;`, (findListingsError, listings, fields) => {
            if (findListingsError) {
                con.end();
                req.flash('error', 'Error.');
                return res.redirect('/dashboard');
            }
    
            averagePrice = 0
            listedItemsCount = 0
            itemsSold = 0
            totalRevenue = 0
            cancelledTransactions = 0
            pendingTransactions = 0
    
            allListingsCount = listings.length
    
            for (i in listings) {
                averagePrice += listings[i].price
                if (listings[i].status == 0) {
                    listedItemsCount += 1
                } else if (listings[i].status == 1 || listings[i].status == 2) {
                    itemsSold += 1
                    totalRevenue += listings[i].price
                } else if (listings[i].status == 3) {
                    cancelledTransactions += 1
                } else if (listings[i].status == 4) {
                    pendingTransactions += 1
                }
            }
            averagePrice /= allListingsCount
            averagePrice = averagePrice.toFixed(2)
            cancelledTransactions *= 10
    
            con.query(`SELECT * FROM transactions;`, (findTransactionsError, transactions, fields) => {
                if (findTransactionsError) {
                    con.end();
                    req.flash('error', 'Error.');
                    return res.redirect('/dashboard');
                }
    
                con.query(`SELECT * FROM disputes;`, (findDisputesError, disputes, fields) => {
                    if (findDisputesError) {
                        con.end();
                        req.flash('error', 'Error.');
                        return res.redirect('/dashboard');
                    }
    
                    numDisputes = disputes.length
                    disputeRatio = numDisputes * 10 / transactions.length
    
                    con.end();
                    return res.render('platform/admin/dashboard.hbs', {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        page_name: 'Dashboard',
                        user_email: users[0].email,
                        user_phone_number: users[0].phone_number,
                        user_location: users[0].location,
                        user_first_name: users[0].first_name,
                        user_last_name: users[0].last_name,
                        user_two_factor: users[0].two_factor,
                        averagePrice: averagePrice,
                        listedItemsCount: listedItemsCount,
                        itemsSold: itemsSold,
                        totalRevenue: totalRevenue,
                        cancelledTransactions: cancelledTransactions,
                        pendingTransactions: pendingTransactions,
                        disputeRatio: disputeRatio
                    });
                });
            });
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
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, currentUser, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT transactions.id, transactions.status, listings.title, listings.description, listings.price, listings.listing_type, transactions.date, transactions.buyer, transactions.seller FROM transactions JOIN listings ON transactions.listing_id = listings.id;`, (errorGettingTransactions, transactions, fields) => {
            if (errorGettingTransactions) {
                console.log(errorGettingTransactions);
                con.end();
                req.flash('error', 'Error.');
                return res.redirect('/admin/dashboard');
            }
            con.end();
            return res.render('platform/admin/transactions.hbs', {
                error: req.flash('error'),
                success: req.flash('success'),
                page_name: 'BoilerMarket Transactions',
                user_email: currentUser[0].email,
                user_phone_number: currentUser[0].phone_number,
                user_location: currentUser[0].location,
                user_first_name: currentUser[0].first_name,
                user_last_name: currentUser[0].last_name,
                user_two_factor: currentUser[0].two_factor,
                transactions: transactions,
            });
        });
    });
});

router.get(`/view-transaction`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
  let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findCurrentUserError, currentUser, fields) => {
    if (findCurrentUserError) {
      console.log(findCurrentUserError);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect('/admin/dashboard');
    }
    con.query(`SELECT transactions.buyer_cancel, transactions.seller_cancel, transactions.status as 'transaction_status', transactions.id as 'transaction_id', listings.id as 'listing_id', transactions.date as 'transaction_date', listings.price as 'transaction_price', listings.title as 'listing_title', listings.description as 'listing_description', listings.listing_type, listings.duration as 'rent_duration', transactions.buyer as 'transaction_buyer', transactions.seller as 'transaction_seller' FROM transactions JOIN listings ON transactions.listing_id = listings.id WHERE transactions.id=${mysql.escape(req.query.transaction_id)};`, (errorFindingTransaction, transaction, fields) => {
      if (errorFindingTransaction) {
        console.log(errorFindingTransaction);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect('/admin/dashboard');
      }
      if (transaction.length === 0) {
        con.end();
        req.flash('error', 'Error. Transaction not found.');
        return res.redirect('/admin/dashboard');
      }
      con.end();
      
      /* Show 'Mark as Complete' Button Logic */
      showCompleteButton = transaction[0].transaction_status !== 1 && transaction[0].transaction_status !== 2
      /* END - Show 'Mark as Complete' Button Logic */

      /* Show 'Cancel' Button Logic */
      showCancelButton = transaction[0].transaction_status !== 3
      /* END - Show 'Cancel' Button Logic */

      /* Show 'Dispute' Button Logic */
      showDisputeButton = transaction[0].transaction_status !== 5
      /* END - Show 'Dispute' Button Logic */

      /* Obtain chatCurrentUser & chatRecipient values */
      let chatCurrentUser = req.user.id;
      let chatRecipientUser = 0;
      if (transaction[0].transaction_buyer !== req.user.id) chatRecipientUser = transaction[0].transaction_buyer;
      else chatRecipientUser = transaction[0].transaction_seller;
      /* END - Obtain BuyerID & Seller ID */
      return res.render('platform/admin/view-transaction.hbs', {
        page_name: 'View Transaction',
        user_first_name: currentUser[0].first_name,
        user_last_name: currentUser[0].last_name,
        user_email: currentUser[0].email,
        user_is_admin: req.user.is_admin,
        error: req.flash('error'),
        success: req.flash('success'),
        transaction: transaction[0],
        showCompleteButton: showCompleteButton,
        showCancelButton: showCancelButton,
        showDisputeButton: showDisputeButton,
        chatCurrentUser: chatCurrentUser,
        chatRecipientUser: chatRecipientUser,
      });
    });
  });
});

router.post(`/transaction/open-dispute`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    req.checkBody('seller_rating', 'Seller rating is required.').notEmpty();
    req.checkBody('dispute_reason', 'Dispute reason is required.').notEmpty();
    let formErrors = req.validationErrors();
    if (formErrors) {
      req.flash('error', formErrors[0].msg);
      return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM transactions WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorFindingTransaction, transaction, fields) => {
      if (errorFindingTransaction) {
        console.log(errorFindingTransaction);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
      }
      if (transaction.length !== 0) {
        if (transaction[0].status === 5) {
            con.end();
            req.flash('error', 'Error. Transaction has already been escalated to a dispute.');
            return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
        }
        con.query(`INSERT INTO disputes (id, transaction_id, reason, status) VALUES (${mysql.escape(uuidv4())}, ${mysql.escape(req.body.transaction_id)}, ${mysql.escape(req.body.dispute_reason)}, 0);`, (errorInsertingDispute, insertDisputeResult, fields) => {
            if (errorInsertingDispute) {
              console.log(errorInsertingDispute);
              con.end();
              req.flash('error', 'Error.');
              return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
            }
            con.query(`UPDATE transactions SET status=5, seller_rating=${mysql.escape(Number(req.body.seller_rating))}, buyer_cancel=0, seller_cancel=0 WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorUpdatingTransaction, updateTransactionResult, fields) => {
              if (errorUpdatingTransaction) {
                console.log(errorUpdatingTransaction);
                con.end();
                req.flash('error', 'Error.');
                return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
              }
              con.query(`UPDATE listings SET status=5 WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdatingListing, updateListingResult, fields) => {
                if (errorUpdatingListing) {
                  console.log(errorUpdatingListing);
                  con.end();
                  req.flash('error', 'Error.');
                  return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
                }
                TransactionFunctions.email_openDispute(transaction[0].buyer, transaction[0]);
                TransactionFunctions.email_openDispute(transaction[0].seller, transaction[0]);
                con.end();
                req.flash('success', 'Escalated to a dispute.');
                return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
              });
            });
          });
      } else {
        con.end();
        req.flash('error', 'Error. Transaction not found.');
        return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
      }
    });
});

router.get(`/transaction/cancel`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM transactions WHERE id=${mysql.escape(req.query.transaction_id)};`, (errorFindingTransaction, transaction, fields) => {
      if (errorFindingTransaction) {
        console.log(errorFindingTransaction);
        con.end();
        req.flash('error', 'Error.');
        return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
      }
      if (transaction.length !== 0) {
        if (transaction[0].status === 3) {
            con.end();
            req.flash('error', 'Error. Transaction has already been cancelled.');
            return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
        } else if (transaction[0].status === 5) {
            con.query(`DELETE FROM disputes WHERE transaction_id=${mysql.escape(req.query.transaction_id)};`, (errorDeletingDispute, deleteDisputeResult, fields) => {
                if (errorDeletingDispute) {
                    console.log(errorDeletingDispute);
                    con.end();
                    req.flash('error', 'Error deleting dispute.');
                    return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                }
                con.query(`UPDATE transactions SET buyer_cancel=1, seller_cancel=1, status=3, seller_rating=NULL WHERE id=${mysql.escape(req.query.transaction_id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
                    if (errorUpdateTransaction) {
                      console.log(errorUpdateTransaction);
                      con.end();
                      req.flash('error', 'Error updating transaction.');
                      return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                    }
                    con.query(`UPDATE listings SET status=3 WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdateListing, updateListingResult, fields) => {
                      if (errorUpdateListing) {
                        console.log(errorUpdateListing);
                        con.end();
                        req.flash('error', 'Error updating listing.');
                        return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                      }
                      TransactionFunctions.email_cancelTransaction(transaction[0].buyer, transaction[0].listing_id);
                      TransactionFunctions.email_cancelTransaction(transaction[0].seller, transaction[0].listing_id);
                      req.flash(`success`, `Transaction has been cancelled.`)
                      con.end();
                      return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                    });
                  });
            });
        } else {
            con.query(`UPDATE transactions SET buyer_cancel=1, seller_cancel=1, status=3, seller_rating=NULL WHERE id=${mysql.escape(req.query.transaction_id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
                if (errorUpdateTransaction) {
                  console.log(errorUpdateTransaction);
                  con.end();
                  req.flash('error', 'Error updating transaction.');
                  return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                }
                con.query(`UPDATE listings SET status=3 WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdateListing, updateListingResult, fields) => {
                  if (errorUpdateListing) {
                    console.log(errorUpdateListing);
                    con.end();
                    req.flash('error', 'Error updating listing.');
                    return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                  }
                  TransactionFunctions.email_cancelTransaction(transaction[0].buyer, transaction[0].listing_id);
                  TransactionFunctions.email_cancelTransaction(transaction[0].seller, transaction[0].listing_id);
                  req.flash(`success`, `Transaction has been cancelled.`)
                  con.end();
                  return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
                });
              });
        }
      } else {
        con.end();
        req.flash('error', 'Error. Transaction not found.');
        return res.redirect(`/admin/view-transaction?transaction_id=${req.query.transaction_id}`);
      }
    });
});

router.post('/transaction/complete', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM transactions WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorFindingTransaction, transaction, fields) => {
        if (errorFindingTransaction) {
            console.log(errorFindingTransaction);
            con.end();
            req.flash('error', 'Error finding transaction.');
            return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
        }
        if (transaction.length === 0) {
            con.end();
            req.flash('error', 'Error. Transaction not found.');
            return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
        }

        con.query(`SELECT * FROM listings WHERE id='${transaction[0].listing_id}';`, (errorFindingListing, listing, fields) => {
            if (errorFindingListing) {
                console.log(errorFindingListing);
                con.end();
                req.flash('error', 'Error finding listing.');
                return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
            }
            if (listing.length !== 1) {
                con.end();
                req.flash('error', 'Error. Listing not found.');
                return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
            }
            newStatus = listing[0].listing_type;
            if (transaction[0].status === 5) {
                con.query(`DELETE FROM disputes WHERE transaction_id=${mysql.escape(req.body.transaction_id)};`, (errorDeletingDispute, deleteDisputeResult, fields) => {
                    if (errorDeletingDispute) {
                        console.log(errorDeletingDispute);
                        con.end();
                        req.flash('error', 'Error deleting dispute.');
                        return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
                    }
                });
            }
            con.query(`UPDATE transactions SET status=${newStatus}, seller_rating=${mysql.escape(Number(req.body.seller_rating))}, buyer_cancel=0, seller_cancel=0 WHERE id=${mysql.escape(req.body.transaction_id)};`, (errorUpdateTransaction, updateTransactionResult, fields) => {
                if (errorUpdateTransaction) {
                    console.log(errorUpdateTransaction);
                    con.end();
                    req.flash('error', 'Error updating transaction.');
                    return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
                }
                con.query(`UPDATE listings SET status=${newStatus} WHERE id=${mysql.escape(transaction[0].listing_id)};`, (errorUpdateListing, updateListingResult, fields) => {
                    if(errorUpdateListing) {
                        console.log(errorUpdateListing);
                        con.end();
                        req.flash('error', 'Error updating listing.');
                        return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
                    }
                    TransactionFunctions.email_completeTransaction(transaction[0].buyer, listing[0].title);
                    TransactionFunctions.email_completeTransaction(transaction[0].seller, listing[0].title);
                    req.flash(`success`, `Transaction completed.`)
                    con.end();
                    return res.redirect(`/admin/view-transaction?transaction_id=${req.body.transaction_id}`);
                });
            });
        });
    });
});

router.post(`/ban-user/:user_id`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`UPDATE users SET ban=1 WHERE id=${mysql.escape(req.params.user_id)};`, (errorBanningUser, updateUserResult, fields) => {
        if (errorBanningUser) {
            console.log(errorBanningUser);
            con.end();
            req.flash('error', 'Error banning user.');
            return res.redirect(`/admin/view-user/${req.params.user_id}`);
        }
        con.end();
        req.flash('success', 'Successfully banned user.');
        return res.redirect(`/admin/view-user/${req.params.user_id}`);
    });
});

router.get(`/disputes`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, currentUser, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT dispute_id, transaction_id, dispute_reason, dispute_status, dispute_date, buyer_id, seller_id, buyer_email, users.email as 'seller_email' FROM (SELECT dispute_id, transaction_id, dispute_reason, dispute_status, dispute_date, buyer_id, seller_id, users.email as 'buyer_email' FROM (SELECT disputes.id as 'dispute_id', disputes.transaction_id, disputes.reason as 'dispute_reason', disputes.status as 'dispute_status', disputes.date as 'dispute_date', transactions.buyer as 'buyer_id', transactions.seller as 'seller_id' FROM disputes JOIN transactions ON disputes.transaction_id = transactions.id) AS T1 JOIN users ON T1.buyer_id = users.id) AS T2 JOIN users ON T2.seller_id = users.id;`, (errorFetchingDisputes, disputes, fields) => {
            if (errorFetchingDisputes) {
                con.end();
                req.flash('error', 'Error fetching disputes.');
                return res.redirect('/admin/dashboard');
            }
            con.end();
            return res.render('platform/admin/disputes.hbs', {
                page_name: 'View Transaction',
                user_first_name: currentUser[0].first_name,
                user_last_name: currentUser[0].last_name,
                user_email: currentUser[0].email,
                user_is_admin: req.user.is_admin,
                error: req.flash('error'),
                success: req.flash('success'),
                disputes: disputes,
            });
        });
    });
});

router.get(`/view-dispute/:dispute_id`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, currentUser, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT dispute_id, transaction_id, dispute_reason, dispute_status, dispute_date, buyer_id, seller_id, buyer_email, users.email as 'seller_email' FROM (SELECT dispute_id, transaction_id, dispute_reason, dispute_status, dispute_date, buyer_id, seller_id, users.email as 'buyer_email' FROM (SELECT disputes.id as 'dispute_id', disputes.transaction_id, disputes.reason as 'dispute_reason', disputes.status as 'dispute_status', disputes.date as 'dispute_date', transactions.buyer as 'buyer_id', transactions.seller as 'seller_id' FROM disputes JOIN transactions ON disputes.transaction_id = transactions.id) AS T1 JOIN users ON T1.buyer_id = users.id) AS T2 JOIN users ON T2.seller_id = users.id WHERE dispute_id = ${mysql.escape(req.params.dispute_id)};`, (errorFetchingDispute, dispute, fields) => {
            if (errorFetchingDispute) {
                con.end();
                console.log(errorFetchingDispute);
                req.flash('error', 'Error fetching dispute.');
                return res.redirect('/admin/disputes');
            }
            con.end();
            if (dispute.length === 0) {
                req.flash('error', 'Error fetching dispute.');
                return res.redirect('/admin/disputes');
            } else {
                showResolveButton = dispute[0].dispute_status === 0
                return res.render('platform/admin/view-dispute.hbs', {
                    page_name: 'View Dispute',
                    user_first_name: currentUser[0].first_name,
                    user_last_name: currentUser[0].last_name,
                    user_email: currentUser[0].email,
                    user_is_admin: req.user.is_admin,
                    error: req.flash('error'),
                    success: req.flash('success'),
                    dispute: dispute[0],
                    showResolveButton: showResolveButton,
                });
            }
        });
    });
});

router.post(`/disputes/resolve`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    req.checkBody('resolved_message', 'Message is required.').notEmpty();
    let formErrors = req.validationErrors();
    if (formErrors) {
        req.flash('error', formErrors[0].msg);
        return res.redirect(`/admin/disputes/${req.body.dispute_id}`);
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT dispute_id, transaction_id, dispute_reason, dispute_status, dispute_date, buyer_id, seller_id, buyer_email, users.email as 'seller_email' FROM (SELECT dispute_id, transaction_id, dispute_reason, dispute_status, dispute_date, buyer_id, seller_id, users.email as 'buyer_email' FROM (SELECT disputes.id as 'dispute_id', disputes.transaction_id, disputes.reason as 'dispute_reason', disputes.status as 'dispute_status', disputes.date as 'dispute_date', transactions.buyer as 'buyer_id', transactions.seller as 'seller_id' FROM disputes JOIN transactions ON disputes.transaction_id = transactions.id) AS T1 JOIN users ON T1.buyer_id = users.id) AS T2 JOIN users ON T2.seller_id = users.id WHERE dispute_id = ${mysql.escape(req.body.dispute_id)};`, (errorFindingDispute, dispute, fields) => {
        if (errorFindingDispute) {
            con.end();
            console.log(errorFindingDispute);
            req.flash('error', 'Error fetching dispute.');
            return res.redirect('/admin/disputes');
        }
        if (dispute.length === 0) {
            req.flash('error', 'Error fetching dispute.');
            return res.redirect('/admin/disputes');
        } else {
            con.query(`UPDATE disputes, transactions SET disputes.status = 1, transactions.status = 1, transactions.buyer_cancel = 0, transactions.seller_cancel = 0 WHERE disputes.id = ${mysql.escape(dispute[0].dispute_id)} AND transactions.id = ${mysql.escape(dispute[0].transaction_id)};`, (errorUpdatingDisputeAndTransaction, updateResult, fields) => {
                if (errorUpdatingDisputeAndTransaction) {
                    console.log(errorUpdatingDisputeAndTransaction);
                    con.end();
                    req.flash('error', 'Error on update.');
                    return res.redirect(`/admin/view-dispute/${dispute[0].dispute_id}`);
                }
                con.end();
                req.flash('success', 'Resolved.');
                DisputeFunctions.email_resolvedDispute(dispute[0].buyer_id, dispute, req.body.resolved_message);
                DisputeFunctions.email_resolvedDispute(dispute[0].seller_id, dispute, req.body.resolved_message);
                return res.redirect(`/admin/view-dispute/${dispute[0].dispute_id}`);
            });
        }
    });
});

router.get(`/listings`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, users, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT * FROM listings;`, (errorFetchingListings, listings, fields) => {
            if (errorFetchingListings) {
                con.end();
                console.log(errorFetchingListings);
                req.flash('error', 'Error.');
                return res.redirect('/admin/dashboard');
            }
            con.end();
            return res.render('platform/admin/listings.hbs', {
                error: req.flash('error'),
                success: req.flash('success'),
                page_name: 'BoilerMarket Listings',
                user_email: users[0].email,
                user_phone_number: users[0].phone_number,
                user_location: users[0].location,
                user_first_name: users[0].first_name,
                user_last_name: users[0].last_name,
                user_two_factor: users[0].two_factor,
                listings: listings,
            });
        });
    });
});

router.get(`/edit-listing`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE id=${mysql.escape(req.user.id)};`, (findUserError, users, fields) => {
        if (findUserError) {
            con.end();
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.query.listing_id)};`, (errorFetchingListing, listing, fields) => {
            if (errorFetchingListing) {
                con.end();
                console.log(errorFetchingListing);
                req.flash('error', 'Error.');
                return res.redirect('/admin/listings');
            }
            con.end();
            if (listing.length === 0) {
                req.flash('error', 'Listing not found.');
                return res.redirect('/admin/listings');
            } else {
                return res.render('platform/admin/edit-listing.hbs', {
                    error: req.flash('error'),
                    success: req.flash('success'),
                    page_name: 'BoilerMarket Listings',
                    user_email: users[0].email,
                    user_phone_number: users[0].phone_number,
                    user_location: users[0].location,
                    user_first_name: users[0].first_name,
                    user_last_name: users[0].last_name,
                    user_two_factor: users[0].two_factor,
                    listing: listing[0],
                });
            }
        });
    });
});

router.post('/edit-listing/:listing_id', AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    req.checkBody('listing_title', 'Title field is required.').notEmpty();
    req.checkBody('listing_description', 'Description field is required.').notEmpty();
    req.checkBody('listing_price', 'Price field is required.').notEmpty();
    req.checkBody('listing_type', 'Listing Type field is required.').notEmpty();
    let formErrors = req.validationErrors();
    if (formErrors) {
        req.flash('error', formErrors[0].msg);
        return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
    }
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.listing_id)};`, (errorFindingListings, listings, fields) => {
        if (errorFindingListings) {
          console.log(errorFindingListings);
          con.end();
          req.flash('error', 'Error.');
          return res.redirect('/admin/listings');
        }
        if (listings.length === 0) {
          con.end();
          req.flash('error', 'Error. Listing not found.');
          return res.redirect('/admin/listings');
        } else {
          con.query(`UPDATE listings SET title=${mysql.escape(req.body.listing_title)}, description=${mysql.escape(req.body.listing_description)}, price=${mysql.escape(Number(req.body.listing_price))}, listing_type=${mysql.escape(Number(req.body.listing_type))}, duration=${mysql.escape(Number(req.body.rent_duration))} WHERE id=${mysql.escape(req.params.listing_id)};`, (updateListingError, updateListingResult, fields) => {
            if (updateListingError) {
              console.log(updateListingError);
              con.end();
              req.flash('error', 'Error updating listing.');
              return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
            }
            con.query(`SELECT * FROM transactions WHERE listing_id=${mysql.escape(req.params.listing_id)};`, (errorFetchingTransaction, transaction, fields) => {
                if (errorFetchingTransaction) {
                    console.log(errorFetchingTransaction);
                    con.end();
                    req.flash('error', 'Error updating listing.');
                    return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
                }
                if (transaction.length === 1 && (transaction[0].status === 1 || transaction[0].status === 2)) {
                    let durationUpdateVar = 0;
                    if (Number(req.body.listing_type) === 2) durationUpdateVar = Number(req.body.rent_duration);
                    con.query(`UPDATE listings SET status = ${mysql.escape(Number(req.body.listing_type))}, duration=${durationUpdateVar} WHERE id=${mysql.escape(req.params.listing_id)};`, (errorUpdatingListingStatus, updateListingStatusResult, fields) => {
                        if (errorUpdatingListingStatus) {
                            console.log(errorUpdatingListingStatus);
                            con.end();
                            req.flash('error', 'Error updating listing.');
                            return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
                        }
                        con.query(`UPDATE transactions SET status = ${mysql.escape(Number(req.body.listing_type))} WHERE id=${mysql.escape(transaction[0].id)};`, (errorUpdatingTransactionStatus, updateTransactionStatusResult, fields) => {
                            if (errorUpdatingTransactionStatus) {
                                console.log(errorUpdatingTransactionStatus);
                                con.end();
                                req.flash('error', 'Error updating listing.');
                                return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
                            }
                            con.end();
                            req.flash('success', 'Successfully updated listing.');
                            return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
                        });
                    });
                } else {
                    con.end();
                    req.flash('success', 'Successfully updated listing.');
                    return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
                }
            });
          });
        }
      });
});

router.get(`/delete-listing/:listing_id`, AuthenticationFunctions.ensureAuthenticated, AuthenticationFunctions.ensureAdmin, (req, res) => {
    let con = mysql.createConnection(dbInfo);
  con.query(`SELECT * FROM listings WHERE id=${mysql.escape(req.params.listing_id)};`, (errorFindingListings, listings, fields) => {
    if (errorFindingListings) {
      console.log(errorFindingListings);
      con.end();
      req.flash('error', 'Error.');
      return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
    }
    if (listings.length === 0) {
      con.end();
      req.flash('error', 'Error. Listing not found.');
      return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
    } else if (listings[0].status !== 0) {
      con.end();
      req.flash('error', 'A transaction has already or is currently occurring with this item.');
      return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
    } else {
      con.query(`DELETE FROM cart WHERE listing_id=${mysql.escape(req.params.listing_id)};`, (errorRemovingFromCarts, removeListingFromCartsResult, fields)  => {
        if (errorRemovingFromCarts) {
          console.log(errorRemovingFromCarts);
          con.end();
          req.flash('error', 'Error.');
          return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
        }
        con.query(`DELETE FROM listings WHERE id=${mysql.escape(req.params.listing_id)};`, (errorDeletingListing, deleteListingResult, fields) => {
          if (errorDeletingListing) {
            console.log(errorDeletingListing);
            con.end();
            req.flash('error', 'Error.');
            return res.redirect(`/admin/edit-listing?listing_id=${req.params.listing_id}`);
          } else {
            con.end();
            req.flash('success', 'Deleted listing.');
            return res.redirect('/admin/listings');
          }
        });
      });
    }
  });
});



module.exports = router;