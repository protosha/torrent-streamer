var mongoose = require('mongoose');

var TorrentSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    magnet: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    }
});



var Torrent = mongoose.model('Torrent', TorrentSchema);

module.exports = Torrent        ;
