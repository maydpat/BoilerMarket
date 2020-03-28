const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "purdueboilermarket@gmail.com",
      pass: "BoilerMarket1234!"
    }
  });


module.exports = {
  handleEditListingEmails: function(cartObjects, listingTitle) {
    let counter;
    for (counter = 0; counter < cartObjects.length; counter++) {
        let emailContent = `<p>Hello ${cartObjects[counter].first_name} ${cartObjects[counter].last_name},<br><br>A listing with the title, "${listingTitle}", was removed from your BoilerMarket cart as the listing creator edited the listing.</p><p><br><br>Boiler Up!<br>The BoilerMarket Team</p>`;
        const mailOptions = {
            from: 'purdueboilermarket@gmail.com',
            to: cartObjects[counter].email,
            subject: 'BoilerMarket Cart Removal Notification',
            html: emailContent
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
              console.log('Error sending email: ' + err);
            }
          });
    }
  },


}