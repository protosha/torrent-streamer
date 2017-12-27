var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    // res.render('test', { title: 'TEST'; session_status = 'Authed' });

    if (req.session)
        res.render('test', { title: req.session.user_id});
    else
        res.render('test', { title: 'Unauthorized'});

});



module.exports = router;
