const request = require('request');
const _ = require('lodash');
const handlebars = require('handlebars');
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
  appeal_emailAdmins: function() {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM users WHERE admin=1;`, (error, admins, fields) => {
        if (error) {
            console.log(error);
            con.end();
            return;
        }
        let i = 0;
        con.end();
        for (i = 0; i < admins.length; i++) {
            let emailContent = `<p>Hello ${admins[i].first_name} ${admins[i].last_name},<br><br>An ban appeal has been submitted.</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
            const mailOptions = {
                from: 'purdueboilermarket@gmail.com',
                to: admins[i].email,
                subject: 'BoilerMarket - Ban Appeal Notification',
                html: emailContent
            };
            transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log('Error sending email: ' + err);
            }
            });
        }
    });
  },


}