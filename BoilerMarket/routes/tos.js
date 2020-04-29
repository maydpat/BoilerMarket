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

router.get('/tos', (AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM settings;`, (fetchError, settings, fields) => {
        if (fetchError) {
            con.end();
            console.log(fetchError);
            req.flash('error', 'Error.');
            return res.redirect('/dashboard');
        }
        con.end();
        return res.render('platform/tos.hbs', {
            settings: settings[0],
        });
    });
}));

module.exports = router;