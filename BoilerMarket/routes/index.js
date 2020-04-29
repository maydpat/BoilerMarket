const express = require('express');
const session = require('express-session');
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt= require('bcryptjs');
const uuidv4 = require('uuid/v4');
const passport = require("passport");
const flash = require('connect-flash');
var request = require("request");
const mysql = require('mysql');
const nodemailer = require('nodemailer');

const LocalStrategy = require('passport-local').Strategy;
const AuthenticationFunctions = require('../Functions/Authentication.js');

router.get('/', AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    return res.redirect('/listings');
});


module.exports = router;