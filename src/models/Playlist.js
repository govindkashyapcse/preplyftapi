const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    isPublic: { type: Boolean, default: false },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videos:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
