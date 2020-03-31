var express = require('express');
var router = express.Router();
var user = require('../lib/user');

router.get('/', (req, res) => {
    res.render('about-us', {username: user.getUsername(req)});
});

module.exports = router;