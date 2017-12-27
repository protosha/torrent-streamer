var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Torrent = require('../models/torrent');


router.get('/', function(req, res, next) {
    console.log("Get list of torrents\n");
    Torrent.find({'user_id': req.session.user_id}, function(err, doc) {
        if (err) {
            console.log(err.message);
            return next(err);
        } else if (doc) {
            console.log("DOC: " + doc);
            res.json(doc);
        }
    });
});

router.post('/', function(req, res, next) {
    console.log("Add torrent\n");
    console.log("Name = "+req.body.name);
    console.log("Magnet = "+req.body.magnet+"\n");

    var d = new Torrent({name: req.body.name, magnet: req.body.magnet, user_id: req.session.user_id});
    d.save();

    res.json(d)
});


router.delete('/:id', function(req, res, next) {
    console.log("Del torrent\n");
    console.log("Name = "+req.params.id);



    res.end()

});

router.get('/:id/file', function(req, res, next) {
    console.log("Get files for torrent: " + req.params.id);

    // var myMap = new Map();
    // myMap.set(0, "value associated with 'a string'");
    // myMap.set(1, "value associated with keyObj");
    // myMap.set(2, "value associated with keyFunc");
    // var jsonres = JSON.stringify([...myMap]);
    //
    //
    // res.json(jsonres);
    res.end()

});



router.get('/:id/files/:fid/video', function(req, res, next) {
    console.log('begin');
    var client = req.torrentClient;
    var torrentId = 'magnet:?' +
        'xt=urn:btih:67EB8FCBD8D8CC08D34621649E9BC83AC669FEFE&tr=http%' +
        '3A%2F%2Fbt4.t-ru.org%2Fann%3Fmagnet&dn=%5BiPhone%5D%20%D0%9A%' +
        'D0%BB%D0%B8%D0%BD%D0%B8%D0%BA%D0%B0%20%2F%20Scrubs%20%2F%20%D' +
        '0%A1%D0%B5%D0%B7%D0%BE%D0%BD%201-9%20(9)%20%2F%20%D0%A1%D0%B5' +
        '%D1%80%D0%B8%D0%B8%201-182%20(182)%20(%D0%9C%D0%B0%D0%B9%D0%B' +
        'A%D0%BB%20%D0%A1%D0%BF%D0%B8%D0%BB%D0%BB%D0%B5%D1%80%2C%20%D0' +
        '%94%D0%B6%D0%BE%D0%BD%20%D0%98%D0%BD%D0%B2%D1%83%D0%B4%2C%20%' +
        'D0%97%D0%B0%D0%BA%20%D0%91%D1%80%D0%B0%D1%84%D1%84)%20%5B2001' +
        '-2010%2C%20%D0%B4%D1%80%D0%B0%D0%BC%D0%B0%2C%20%D0%BA%D0%BE%D' +
        '0%BC%D0%B5%D0%B4%D0%B8%D1%8F%2C%20DVDRip%2C%20480x360%5D%20MVO%20';
    var filePath = 'Scrubs/Season 1/1.01 - My First Day.mp4';
    var startStream = function(file, range) {
        var fileSize = file.length;
        console.log(range);
        var headers;
        if (range) {
            var parts = range.replace(/bytes=/, '').split('-');
            var start = parseInt(parts[0], 10);
            var end = (parts[1]) ? parseInt(parts[1], 10) : fileSize - 1;

            var chunkSize = (end - start) + 1;
            var stream = file.createReadStream({start: start, end: end});
            headers = {
                'Content-Range': 'bytes ' + start + ' - ' + end + '/' + fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            };
            console.log(headers);

            res.writeHead(206, headers);
            stream.pipe(res);

            stream.on('error', function(err) {
                next(err);
            })
        } else {
            headers = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            };

            res.writeHead(200, headers);
            file.createReadStream().pipe(res);
        }
    };

    var findFile = function(torrent, filePath) {
        for (var i = 0; i < torrent.files.length; i++) {
            var file = torrent.files[i];
            if (file.path === filePath) {
                return file;
            }
        }
    };

    var torrent = client.get(torrentId);
    console.log('before load');
    if (torrent) {
        var file = torrent.files[0];
        startStream(file, req.headers.range);

    } else {
        client.add(torrentId, { store: false }, function(torrent) {
            console.log('Torrent is downloading: ' + torrent.infoHash);
            torrent._selections = [];

            var file = torrent.files[0];
            startStream(file, req.headers.range);

        });
    }

});

router.get('/:id/files/:fid/video/get', function(req, res) {
    //var torrentId = req.torrentId;
    // let's for now just say we have a parameter "torrentId"
    var torrentId = 'magnet:?' +
        'xt=urn:btih:67EB8FCBD8D8CC08D34621649E9BC83AC669FEFE&tr=http%' +
        '3A%2F%2Fbt4.t-ru.org%2Fann%3Fmagnet&dn=%5BiPhone%5D%20%D0%9A%' +
        'D0%BB%D0%B8%D0%BD%D0%B8%D0%BA%D0%B0%20%2F%20Scrubs%20%2F%20%D' +
        '0%A1%D0%B5%D0%B7%D0%BE%D0%BD%201-9%20(9)%20%2F%20%D0%A1%D0%B5' +
        '%D1%80%D0%B8%D0%B8%201-182%20(182)%20(%D0%9C%D0%B0%D0%B9%D0%B' +
        'A%D0%BB%20%D0%A1%D0%BF%D0%B8%D0%BB%D0%BB%D0%B5%D1%80%2C%20%D0' +
        '%94%D0%B6%D0%BE%D0%BD%20%D0%98%D0%BD%D0%B2%D1%83%D0%B4%2C%20%' +
        'D0%97%D0%B0%D0%BA%20%D0%91%D1%80%D0%B0%D1%84%D1%84)%20%5B2001' +
        '-2010%2C%20%D0%B4%D1%80%D0%B0%D0%BC%D0%B0%2C%20%D0%BA%D0%BE%D' +
        '0%BC%D0%B5%D0%B4%D0%B8%D1%8F%2C%20DVDRip%2C%20480x360%5D%20MVO%20';
    var filePath = 'Scrubs/Season 1/1.01 - My First Day.mp4';
    var client = req.torrentClient;
    var torrent = client.get(torrentId);
    var selectedFile = null;
    console.log('inside get');
    if (torrent) {
        // do stuff
        for (var i = 0; i < torrent.files.length; i++) {
            var file = torrent.files[i];
            console.log(file.path);
            if (file.path === filePath) {
                file.select();
                selectedFile = file;
            }
        }
    }

    if (selectedFile) {
        var fileSize = selectedFile.length;
        var range = req.headers.range;

        console.log(range);
        if (range) {
            var parts = range.replace(/bytes=/, '').split('-');
            var start = parseInt(parts[0], 10);
            var end = (parts[1])? parseInt(parts[1], 10) : fileSize - 1;

            var chunkSize = (end - start) + 1;
            var headers = {
                'Content-Range': 'bytes ' + start + ' - ' + end + '/' + chunkSize,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            };
            console.log(headers);

            res.writeHead(206, headers);
            selectedFile.createReadStream({ start: start, end: end }).pipe(res);
        } else {
            var headers = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            };

            res.writeHead(200, headers);
            selectedFile.createReadStream().pipe(res);
        }
    } else {
        res.writeHead(404);
        res.send('Not Found');
    }
});



module.exports = router;