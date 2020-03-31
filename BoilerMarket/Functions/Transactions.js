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


}