var express = require('express');
var router = express.Router();

/* GET contract page. */
router.get('/', (req, res) => {
    res.render('contact');
});

module.exports = router;