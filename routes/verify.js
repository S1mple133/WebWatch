var express = require('express');
var router = express.Router();
var auth = require('../lib/authentication')

router.get('/', auth.verify);
module.exports = router;