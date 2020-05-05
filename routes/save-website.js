var express = require('express');
var router = express.Router();
var user = require('../lib/user');
var hashlib = require('../lib/hashlib');

/* GET save websites page. */
router.get('/', user.isAuthenticated, (req, res, next) => {
    res.render('save-website', { username: user.getUsername(req) });
});

router.post('/', user.isAuthenticated, async (req, res) => {
    hash = await hashlib.saveUrlData(req.body.url, req.user.uid);
    req.flash('success', 'Website successfully saved!');
    return res.redirect("/");
});

module.exports = router;