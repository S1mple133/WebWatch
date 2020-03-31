var express = require('express');
var auth = require('../lib/authentication');
var router = express.Router();

router.get('/', (req, res) => {
    return res.render('reset-pass');
});

router.post('/', auth.sendResetPasswordMail);

module.exports = router;