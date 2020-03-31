var express = require('express');
var router = express.Router();
var user = require('../lib/user');

router.get('/', (req, res) => {
  res.render('index' /*,
  {
    success: req.flash('success')[0],
    failure: req.flash('failure')[0],
    username: user.getUsername(req)
  }*/);
});

module.exports = router;
