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

router.get(`/chat/messages`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    con.query(`SELECT * FROM messages WHERE (sender=${mysql.escape(req.query.currentUser)} AND transaction_id=${mysql.escape(req.query.transactionID)} AND recipient=${mysql.escape(req.query.recipientUser)}) OR (sender=${mysql.escape(req.query.recipientUser)} AND transaction_id=${mysql.escape(req.query.transactionID)} AND recipient=${mysql.escape(req.query.currentUser)}) ORDER BY date DESC;`, (error, messages, fields) => {
        if (error) {
            console.log(error);
            con.end();
            return res.send();
        }
        con.end();
        return res.send(messages);
    });
});

router.post(`/chat/messages`, AuthenticationFunctions.ensureAuthenticated, (req, res) => {
    let con = mysql.createConnection(dbInfo);
    if (req.body.sendMessageContent.length >= 1 && req.body.sendMessageContent.length <= 2000) {
        con.query(`INSERT INTO messages (id, transaction_id, sender, recipient, content) VALUES (${mysql.escape(req.body.id)}, ${mysql.escape(req.body.transaction_id)}, ${mysql.escape(req.body.currentUser)}, ${mysql.escape(req.body.recipientUser)}, ${mysql.escape(req.body.sendMessageContent)});`, (error, result, fields) => {
        if (error) {
            console.log(error);
            con.end();
            return res.send();
        }
        con.end();
        req.io.sockets.emit('message', req.body);
        return res.sendStatus(200);
        });
    } else {
        con.end();
        return res.send();
    }
});
  


module.exports = router;