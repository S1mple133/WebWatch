var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', (req, res) => {
    res.render('login' ,
    {
      failure: req.flash('error')[0]
    });
});

router.post('/', passport.authenticate('local', {
        successRedirect: '/',
        failureFlash: 'Invalid username or password.',
        successFlash: 'Logged in!',
        failureRedirect: '/login'
    }), function(req, res, info){
        console.log(info);
        res.render('/');
});

module.exports = router;