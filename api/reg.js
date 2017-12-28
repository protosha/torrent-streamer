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

        User.create(userData, function (err, user) {
            if (err) {
                // console.log("Error = "+error.toString()+"\n");
                res.json({success: false, err: err.message});
            } else {
                req.session.user_id = user;
                // noinspection JSAnnotator
                res.json({success: true});
            }
        });
    }
});



module.exports = router;