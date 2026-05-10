const Channel = require('../models/Channel');
const Video   = require('../models/Video');
const Course  = require('../models/Course');
const { getPagination, buildPaginationResult } = require('../utils/pagination');

// GET /channels
const getChannels = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [channels, total] = await Promise.all([
    Channel.find().select('-subscribers').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Channel.countDocuments(),
  ]);
  res.json({ channels, pagination: buildPaginationResult(total, page, limit) });
};

// GET /channels/mine  🔒 instructor
const getMyChannels = async (req, res) => {
  const channels = await Channel.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(channels);
};

// GET /channels/:id
const getChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id).select('-subscribers');
  if (!channel) return res.status(404).json({ message: 'Channel not found' });

  const [videos, courses] = await Promise.all([
    Video.find({ channel: channel._id, visibility: 'public' })
      .select('title description videoUrl thumbnail duration visibility views likeCount commentCount channel createdAt updatedAt')
      .populate('channel', 'name icon'),
    Course.find({ channel: channel._id })
      .select('title description thumbnail price channel createdAt updatedAt')
      .populate('channel', 'name icon'),
  ]);

  res.json({ ...channel.toObject(), videos, courses });
};

// POST /channels  🔒
const createChannel = async (req, res) => {
  const { name, description, icon, poster } = req.body;
  if (!name) return res.status(400).json({ message: 'Channel name is required' });

  const channel = await Channel.create({ name, description, icon, poster, owner: req.user.id });
  res.status(201).json(channel);
};

// PATCH /channels/:id  🔒 instructor
const updateChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) return res.status(404).json({ message: 'Channel not found' });
  if (channel.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not your channel' });

  const { name, description, icon, poster } = req.body;
  if (name        !== undefined) channel.name        = name;
  if (description !== undefined) channel.description = description;
  if (icon        !== undefined) channel.icon        = icon;
  if (poster      !== undefined) channel.poster      = poster;
  await channel.save();
  res.json(channel);
};

// POST /channels/:id/subscribe  🔒
const toggleSubscribe = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) return res.status(404).json({ message: 'Channel not found' });

  const uid = req.user.id;
  const idx = channel.subscribers.findIndex((s) => s.toString() === uid);
  let subscribed;

  if (idx === -1) {
    channel.subscribers.push(uid);
    subscribed = true;
  } else {
    channel.subscribers.splice(idx, 1);
    subscribed = false;
  }
  channel.subscriberCount = channel.subscribers.length;
  await channel.save();
  res.json({ subscribed, subscriberCount: channel.subscriberCount });
};

module.exports = { getChannels, getMyChannels, getChannel, createChannel, updateChannel, toggleSubscribe };
