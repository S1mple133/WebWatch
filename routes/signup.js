var express = require('express');
var router = express.Router();
var auth = require('../lib/authentication');
var user = require('../lib/user');

/* GET signup page. */
router.get('/', (req, res) => {
    res.render('signup',
    {
        username: user.getUsername(req),
        failure: req.flash('failure')[0]
    });
});

router.post('/', auth.signup);

module.exports = router;