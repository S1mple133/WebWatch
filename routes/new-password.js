var express = require('express');
var auth = require('../lib/authentication.js');
var router = express.Router();

router.get('/', (req, res)  => {
    return res.render('new-password', {token : req.query.token, uid: req.query.uid});
});

router.post('/', auth.resetPassword);

module.exports = router;