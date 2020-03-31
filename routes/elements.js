var express = require('express');
var router = express.Router();

/* GET elements page. */
router.get('/', (req, res) => {
    res.render('elements', {username: getUsername(req)});
});

module.exports = router;