const nodemailer = require('nodemailer');
const mysql = require('mysql');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "purdueboilermarket@gmail.com",
      pass: "BoilerMarket1234!"
    }
  });
let dbInfo = {
  connectionLimit: 100,
  host: '34.68.115.37',
  user: 'root1',
  password: 'BoilerMarket1234!',
  database: 'boilermarket',
  port: 3306,
  multipleStatements: true
};


module.exports = {
  email_openDispute: function(user_id, transaction) {
    let con = mysql.createConnection(dbInfo);
    if (user_id && transaction) {
      con.query(`SELECT * FROM users WHERE id=${mysql.escape(user_id)};`, (errorGettingUser, user, fields) => {
        if (errorGettingUser) {
          console.log(errorGettingUser);
          con.end();
          return;
        }
        if (user.length !== 0) {
          con.query(`SELECT * FROM listings WHERE id=${mysql.escape(transaction.listing_id)};`, (errorGettingListing, listing, fields) => {
            if (errorGettingListing) {
              console.log(errorGettingListing);
              con.end();
              return;
            }
            if (listing.length !== 0) {
              con.end();
              let emailContent = `<p>Hello ${user[0].first_name} ${user[0].last_name},<br><br>A listing with the title, "${listing[0].title}", was escalated to a dispute.</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
              const mailOptions = {
                from: 'purdueboilermarket@gmail.com',
                to: user[0].email,
                subject: 'BoilerMarket - Dispute Escalation',
                html: emailContent
              };
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log('Error sending email: ' + err);
                }
              });
            } else {
              con.end();
              return;
            }
          });
        } else {
          con.end();
          return;
        }
      });
    } else {
      con.end();
      return;
    }
  },

  email_createTransaction: function(user_id, listing_title) {
    let con = mysql.createConnection(dbInfo);
    if (user_id && listing_title) {
      con.query(`SELECT * FROM users WHERE id=${mysql.escape(user_id)};`, (errorGettingUser, user, fields) => {
        if (errorGettingUser) {
          console.log(errorGettingUser);
          con.end();
          return;
        }
        if (user.length === 1) {
          con.end();
          let emailContent = `<p>Hello ${user[0].first_name} ${user[0].last_name},<br><br>A transaction has been created for the listing with title, "${listing_title}".</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
          const mailOptions = {
            from: 'purdueboilermarket@gmail.com',
            to: user[0].email,
            subject: 'BoilerMarket - Transaction Created',
            html: emailContent
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log('Error sending email: ' + err);
            }
          });
        } else {
          con.end();
          return;
        }
      });
    } else {
      con.end();
      return;
    }
  },
  email_completeTransaction: function(user_id, listing_title) {
    let con = mysql.createConnection(dbInfo);
    if (user_id && listing_title) {
      con.query(`SELECT * FROM users WHERE id=${mysql.escape(user_id)};`, (errorGettingUser, user, fields) => {
        if (errorGettingUser) {
          console.log(errorGettingUser);
          con.end();
          return;
        }
        if (user.length === 1) {
          con.end();
          let emailContent = `<p>Hello ${user[0].first_name} ${user[0].last_name},<br><br>A transaction has been completed for the listing with title, "${listing_title}".</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
          const mailOptions = {
            from: 'purdueboilermarket@gmail.com',
            to: user[0].email,
            subject: 'BoilerMarket - Transaction Completed',
            html: emailContent
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log('Error sending email: ' + err);
            }
          });
        } else {
          con.end();
          return;
        }
      });
    } else {
      con.end();
      return;
    }

  },
  email_cancelTransaction: function(user_id, listing_id) {
    let con = mysql.createConnection(dbInfo);
    if (user_id && listing_id) {
      con.query(`SELECT * FROM users WHERE id=${mysql.escape(user_id)};`, (errorGettingUser, user, fields) => {
        if (errorGettingUser) {
          console.log(errorGettingUser);
          con.end();
          return;
        }
        if (user.length === 1) {
          con.query(`SELECT * FROM listings WHERE id=${mysql.escape(listing_id)};`, (errorGettingListing, listing, fields) => {
            if (errorGettingListing) {
              console.log(errorGettingListing);
              con.end();
              return;
            }
            if (listing.length === 1) {
              con.end();
              let emailContent = `<p>Hello ${user[0].first_name} ${user[0].last_name},<br><br>A transaction has been cancelled for the listing with title, "${listing[0].title}".</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
              const mailOptions = {
                from: 'purdueboilermarket@gmail.com',
                to: user[0].email,
                subject: 'BoilerMarket - Transaction Cancelled',
                html: emailContent
              };
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log('Error sending email: ' + err);
                }
              });
            } else {
              con.end();
              return;
            }
          });
        } else {
          con.end();
          return;
        }
      });
    } else {
      con.end();
      return;
    }
  },

  set_complete_date_for_transaction: function(transaction_id) {
    let currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let con = mysql.createConnection(dbInfo);
    con.query(`UPDATE transactions SET complete_date=${mysql.escape(currentDate)} WHERE id=${mysql.escape(transaction_id)};`, (errorUpdatingDate, updateResult, fields) => {
      if (errorUpdatingDate) {
        con.end();
        console.log(errorUpdatingDate);
        return;
      }
      con.end();
    });
  },

  check_rental_periods: function() {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT users.email as 'buyer_email', users.first_name, users.last_name, listing_status, rent_duration, transaction_status, listing_type, complete_date FROM (SELECT transactions.buyer, listings.status as 'listing_status', listings.duration as 'rent_duration', transactions.status as 'transaction_status', listings.listing_type, transactions.complete_date FROM transactions JOIN listings ON transactions.listing_id = listings.id WHERE listings.listing_type=2 AND transactions.status=2) as T1 JOIN users ON T1.buyer = users.id;`, (errorFetchingTransactions, transactions, fields) => {
      if (errorFetchingTransactions) {
        console.log(errorFetchingTransactions);
        con.end();
        return;
      }
      for (let i = 0; i < transactions.length; i++) {
        let transaction_rent_completion_date = new Date(transactions[i].complete_date);
        transaction_rent_completion_date.setDate(transaction_rent_completion_date.getDate() + Number(transactions[i].rent_duration));
        let diff = (transaction_rent_completion_date.getTime() / 1000) - (Date.now() / 1000);
        let hours_remaining = Math.floor(diff / 3600);
        if (hours_remaining === 12) {
          let emailContent = `<p>Hello ${transactions[i].first_name} ${transactions[i].last_name},<br><br>A product you've rented is coming to an end in 12 hours".</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
              const mailOptions = {
                from: 'purdueboilermarket@gmail.com',
                to: transactions[i].buyer_email,
                subject: 'BoilerMarket - Rental Period ending soon',
                html: emailContent
              };
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  console.log('Error sending email: ' + err);
                }
              });
        }
      }
      con.end();
    });
  },


}