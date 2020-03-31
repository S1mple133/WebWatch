var express = require('express');
var router = express.Router();
var user = require('../lib/user');

/* GET save websites page. */
router.get('/', user.isAuthenticated, (req, res, next) => {
    res.render('save-website', { username: getUsername(req) });
});

router.post('/', async (req, res) => {
    hash = await hashlib.saveUrlData(req.body.url, req.user.uid);
    req.flash('success', 'Website successfully saved!');
    return res.redirect("/");
});

module.exports = router;