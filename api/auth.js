var express = require('express');
var router = express.Router();
var User = require('../models/user');


router.post('/login', function(req, res, next) {

    console.log("Login\n");
    console.log("Name = "+req.body.name);
    console.log("Password = "+req.body.pass+"\n");

    User.authenticate(req.body.name, req.body.pass, function (error, user) {
        if (error || !user) {
            var err = new Error('Wrong username or password.');
            res.json({success: false, err: err.message});

        } else {
            // console.log(user);
            // console.log(req.session);
            req.session.user_id = user._id;
            // noinspection JSAnnotator
            res.json({success: true});
        }
    });
});

router.delete('/logout', function(req, res, next) {

    console.log("Logout\n");
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                res.json({success: false, err: err.message});
            } else {
                // noinspection JSAnnotator
                res.json({success: true});
            }
        });
    }
});

module.exports = router;