var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// /* GET home page. */
// router.get('/:title', function(req, res, next) {
//   res.render('index', { title: decodeURIComponent(req.params.title) });
// });

router.get('/video', function(req, res, next) {
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
    var selectedFile = findFile(torrent, filePath);
    if (selectedFile) {
      console.log('File found: "' + selectedFile.path + '"');
      startStream(selectedFile, req.headers.range);
    }
  } else {
    client.add(torrentId, { path: fileRoot }, function(torrent) {
      console.log('Torrent is downloading: ' + torrent.infoHash);

      torrent.deselect(0, torrent.pieces.length - 1, false);
      var selectedFile = null;
      for (var i = 0; i < torrent.files.length; i++) {
        var file = torrent.files[i];
        if (file.path === filePath) {
          file.select();
          selectedFile = file;
        } else {
          file.deselect();
        }
      }

      if (selectedFile) {
        console.log('File found: "' + selectedFile.path + '"');
        startStream(selectedFile, req.headers.range);
      }
    });
  }


  // wait 5 second before ending request
  // setTimeout(function() {
  //   if (!isDownloadStarted) {
  //     client.remove(torrentId);
  //     res.redirect('/' + encodeURIComponent('Request timeout'));
  //   }
  // }, 10000);
  //res.send('some info');
});

router.get('/video/get', function(req, res) {
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
