var express = require('express');
var router = express.Router();
var User = require('../models/user');


// router.get('/', function(req, res, next) {
//     res.render('index', { title: 'Registration GET' });
// });


router.post('/', function(req, res, next) {

    console.log("Registration\n");
    console.log("Name = "+req.body.name);
    console.log("Password = "+req.body.pass+"\n");

    if (req.body.name &&
        req.body.pass) {

        var userData = {
            name: req.body.name,
            pass: req.body.pass,
        }

        User.create(userData, function (error, user) {
            if (error) {
                // console.log("Error = "+error.toString()+"\n");
                return next(error);
            } else {
                req.session.user_id = user;
                // noinspection JSAnnotator
                res.render('test', { title: req.session.id });
            }
        });
    }
});



module.exports = router;