var express = require('express');
var router = express.Router();
var user = require('../lib/user');
var ethlib = require('../lib/ethlib');
var path = require('path');

router.use(express.static(path.join(__dirname, "..",'public')));

router.get('/', user.isAuthenticated, async (req, res, next) => {
    res.render('show-websites', {
        title: 'Show Websites',
        websites: (await ethlib.getHashesOfPersonJSON(req.user.uid)),
        username: user.getUsername(req)
    });
});

module.exports = router;