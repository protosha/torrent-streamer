var express = require('express');
var router = express.Router();
var User = require('../models/user');


router.post('/', function(req, res, next) {

    console.log("Login\n");
    console.log("Name = "+req.body.name);
    console.log("Password = "+req.body.pass+"\n");

    User.authenticate(req.body.name, req.body.pass, function (error, user) {
        if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
        } else {
            // console.log(user);
            // console.log(req.session);
            req.session.user_id = user._id;
            // noinspection JSAnnotator
            res.render('test', { title: 'User id: ' + req.session.user_id });
        }
    });
});

router.delete('/', function(req, res, next) {

    console.log("Logout\n");
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                // noinspection JSAnnotator
                res.render('test', { title: req.session.id });
            }
        });
    }
});

module.exports = router;