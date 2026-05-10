const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    description:     { type: String, default: '' },
    icon:            { type: String, default: '' },
    poster:          { type: String, default: '' },
    owner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscribers:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscriberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', channelSchema);
