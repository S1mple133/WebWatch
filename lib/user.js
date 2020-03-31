function getUsername(req) {
    if(req.user === undefined || req.user.firstname === undefined)
        return undefined;

    return "Hello, " + req.user.firstname;
}

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated())
      return next();

    req.flash('failure', 'Not authenticated!');
    res.redirect("/login");
}

module.exports.isAuthenticated = isAuthenticated
module.exports.getUsername = getUsername