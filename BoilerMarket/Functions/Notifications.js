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
  email_tos_update: function() {
    let con = mysql.createConnection(dbInfo);
    con.query('SELECT * FROM users;', (errorFetchingUsers, users, fields) => {
        if (errorFetchingUsers) {
            con.end();
            return;
        }
        con.end();
        let i = 0;
        for (i = 0; i < users.length; i++) {
            let emailContent = `<p>Hello ${users[i].first_name} ${users[i].last_name},<br><br>Our Terms of Service has been updated. Please review it soon!</p><p><br>Boiler Up!<br>The BoilerMarket Team</p>`;
            const mailOptions = {
                from: 'purdueboilermarket@gmail.com',
                to: users[i].email,
                subject: 'BoilerMarket - TOS Update Notification',
                html: emailContent
            };
            transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log('Error sending email: ' + err);
            }
            });
        }
    });
  }


}