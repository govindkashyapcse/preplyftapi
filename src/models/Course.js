const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnail:   { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    channel:     { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    instructor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videos:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
