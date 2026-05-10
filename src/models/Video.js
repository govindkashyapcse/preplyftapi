const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const videoSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: '' },
    videoUrl:     { type: String, required: true },
    thumbnail:    { type: String, default: '' },
    duration:     { type: Number, default: 0 },
    visibility:   { type: String, enum: ['public', 'private'], default: 'public' },
    channel:      { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    uploader:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments:     [commentSchema],
    views:        { type: Number, default: 0 },
    likeCount:    { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ channel: 1 });
videoSchema.index({ visibility: 1 });

module.exports = mongoose.model('Video', videoSchema);
