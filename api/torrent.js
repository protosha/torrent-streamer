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
    console.log("Del torrent");
    console.log("Name = "+req.params.id);
    Torrent.findByIdAndRemove(req.params.id, function(err, torr) {
        if (err) {
            console.log(err.message);
            return next(err);
        } else {
            console.log(torr);
            torr.remove();
        }
    });
    res.end()

});

router.get('/:id/files', function(req, res, next) {
    console.log("Get files for torrent: " + req.params.id);
    var client = req.torrentClient;
    Torrent.findOne({'_id': req.params.id}, function(err, doc) {
        if (err) {
            return next(err);
        } else if (doc) {
            console.log(doc['magnet']);
            var torrent = client.get(doc['magnet']);
            var files = {
                arr: []
            };
            if (torrent) {
                for (var i = 0; i < torrent.files.length; i++) {
                    if (torrent.files[i].path ) {
                        files.arr.push({id: i, name: torrent.files[i].path});
                        console.log('File: ' + torrent.files[i].path);
                    }
                }
                res.json(JSON.stringify(files.arr));
            } else {
                client.add(doc['magnet'], { store: false }, function(torrent) {
                    console.log('Torrent is downloading: ' + torrent.infoHash);
                    torrent._selections = [];
                    for (var i = 0; i < torrent.files.length; i++) {
                        if (torrent.files[i].path ) {
                            files.arr.push({id: i, name: torrent.files[i].path});
                            console.log('File: ' + torrent.files[i].path);
                        }
                    }
                    res.json(JSON.stringify(files.arr));
                });
            }
        }
    });

});



router.get('/:id/files/:fid/video', function(req, res, next) {
    console.log('Params id: ' + req.params.id);
    var client = req.torrentClient;
    Torrent.findOne({'_id': req.params.id}, function(err, doc) {
        if (err) {
            return next(err);
        } else if (doc) {
            var torrent = client.get(doc['magnet']);
            if (torrent) {
                var file = torrent.files[req.params.fid];
                console.log('File: ' + file.path);
                startStream(file, req.headers.range);

            } else {
                client.add(doc['magnet'], { store: false }, function(torrent) {
                    console.log('Torrent is downloading: ' + torrent.infoHash);
                    torrent._selections = [];

                    var file = torrent.files[req.params.fid];
                    startStream(file, req.headers.range);

                });
            }
        }
    });



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


});


module.exports = router;