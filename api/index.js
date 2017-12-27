var express = require('express');
var router = express.Router();

router.use('/login', require('./auth'))
router.use('/reg', require('./reg'))
router.use('/torrent', require('./torrent'))

module.exports = router