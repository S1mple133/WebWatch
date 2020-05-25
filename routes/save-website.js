var express = require('express');
var router = express.Router();
var user = require('../lib/user');
var hashlib = require('../lib/hashlib');

/* GET save websites page. */
router.get('/', user.isAuthenticated, (req, res, next) => {
    res.render('save-website', { username: user.getUsername(req), failure: req.flash('failure')[0], success: req.flash('success')[0] });
});

router.post('/', user.isAuthenticated, async (req, res,next) => {
    try {
        hash = await hashlib.saveUrlData(req.body.url, req.user.uid);
        req.flash('success', 'Website successfully saved!');
    }
    catch(e) {
        console.log(e);
        if(e == "Client hashes don't agree.") {
            req.flash("failure", "Clients don't agree");
        }
        else {
            req.flash("failure", "Website could not be saved!");
        }
    }
    return res.redirect("/save-website");
});

module.exports = router;