var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out!');
    res.redirect("/");
});

module.exports = router;