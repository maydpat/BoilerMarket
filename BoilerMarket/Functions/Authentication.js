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


module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  },

  ensureNotAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) { return res.redirect('/dashboard'); }
    next();
  },

  ensureAdmin: function(req, res, next) {
    if (req.user.is_admin === 0) { return res.redirect('/dashboard'); }
    next();
  },


}