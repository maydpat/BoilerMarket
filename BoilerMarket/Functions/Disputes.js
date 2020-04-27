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
  email_resolvedDispute: function(user_id, dispute, resolved_message) {
    let con = mysql.createConnection(dbInfo);
    if (user_id && dispute) {
      con.query(`SELECT * FROM users WHERE id=${mysql.escape(user_id)};`, (errorGettingUser, user, fields) => {
        if (errorGettingUser) {
          console.log(errorGettingUser);
          con.end();
          return;
        }
        if (user.length !== 0) {
            con.end();
            let emailContent = `<p>Hello ${user[0].first_name} ${user[0].last_name},<br><br>A dispute has beeen resolved. ${resolved_message}</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
            const mailOptions = {
            from: 'purdueboilermarket@gmail.com',
            to: user[0].email,
            subject: 'BoilerMarket - Dispute Resolved',
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
  }


}