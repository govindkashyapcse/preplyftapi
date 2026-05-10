const Video   = require('../models/Video');
const Channel = require('../models/Channel');
const { getPagination, buildPaginationResult } = require('../utils/pagination');

// GET /videos
const getVideos = async (req, res) => {
  const { q, channelId } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { visibility: 'public' };
  if (q)         filter.$text   = { $search: q };
  if (channelId) filter.channel = channelId;

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .select('title description videoUrl thumbnail duration visibility views likeCount commentCount channel createdAt updatedAt')
      .populate('channel', 'name icon')
      .skip(skip).limit(limit).sort({ createdAt: -1 }),
    Video.countDocuments(filter),
  ]);
  res.json({ videos, pagination: buildPaginationResult(total, page, limit) });
};

// GET /videos/bookmarks  🔒
const getBookmarks = async (req, res) => {
  const videos = await Video.find({ bookmarks: req.user.id, visibility: 'public' })
    .populate('channel', 'name icon');
  res.json(videos);
};

// GET /videos/:id
const getVideo = async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate('channel', 'name icon')
    .populate('comments.user', 'name');

  if (!video || video.visibility === 'private') {
    return res.status(404).json({ message: 'Video not found' });
  }

  video.views += 1;
  await video.save();

  const plain = video.toObject();
  plain.comments = plain.comments.map((c) => ({
    _id:       c._id,
    user:      c.user._id,
    name:      c.user.name,
    text:      c.text,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  if (req.user) {
    const uid         = req.user.id;
    plain.isLiked     = video.likes.some((l) => l.toString() === uid);
    plain.isBookmarked = video.bookmarks.some((b) => b.toString() === uid);
  }

  delete plain.likes;
  delete plain.bookmarks;
  res.json(plain);
};

// GET /videos/:id/comments
const getComments = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const video = await Video.findById(req.params.id).populate('comments.user', 'name');
  if (!video) return res.status(404).json({ message: 'Video not found' });

  const all   = [...video.comments].reverse();
  const total = all.length;
  const paged = all.slice(skip, skip + limit);
  const comments = paged.map((c) => ({
    _id:       c._id,
    user:      c.user._id,
    name:      c.user.name,
    text:      c.text,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
  res.json({ comments, pagination: buildPaginationResult(total, page, limit) });
};

// POST /videos  🔒 instructor
const createVideo = async (req, res) => {
  const { title, description, videoUrl, thumbnail, duration, visibility, channelId } = req.body;
  if (!title || !videoUrl || !channelId) {
    return res.status(400).json({ message: 'title, videoUrl and channelId are required' });
  }
  const channel = await Channel.findById(channelId);
  if (!channel) return res.status(404).json({ message: 'Channel not found' });
  if (channel.owner.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You do not own this channel' });
  }

  const video = await Video.create({
    title, description, videoUrl, thumbnail, duration, visibility,
    channel: channelId, uploader: req.user.id,
  });
  res.status(201).json(video);
};

// PATCH /videos/:id  🔒 instructor
const updateVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  if (video.uploader.toString() !== req.user.id) return res.status(403).json({ message: 'Not your video' });

  const { title, description, thumbnail, duration, visibility } = req.body;
  if (title       !== undefined) video.title       = title;
  if (description !== undefined) video.description = description;
  if (thumbnail   !== undefined) video.thumbnail   = thumbnail;
  if (duration    !== undefined) video.duration    = duration;
  if (visibility  !== undefined) video.visibility  = visibility;
  await video.save();
  res.json(video);
};

// DELETE /videos/:id  🔒 instructor
const deleteVideo = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });
  if (video.uploader.toString() !== req.user.id) return res.status(403).json({ message: 'Not your video' });
  await video.deleteOne();
  res.json({ message: 'Video deleted' });
};

// POST /videos/:id/like  🔒
const toggleLike = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });

  const uid = req.user.id;
  const idx = video.likes.findIndex((l) => l.toString() === uid);
  let liked;

  if (idx === -1) { video.likes.push(uid); liked = true; }
  else            { video.likes.splice(idx, 1); liked = false; }

  video.likeCount = video.likes.length;
  await video.save();
  res.json({ liked, likeCount: video.likeCount });
};

// POST /videos/:id/bookmark  🔒
const toggleBookmark = async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });

  const uid = req.user.id;
  const idx = video.bookmarks.findIndex((b) => b.toString() === uid);
  let bookmarked;

  if (idx === -1) { video.bookmarks.push(uid); bookmarked = true; }
  else            { video.bookmarks.splice(idx, 1); bookmarked = false; }

  await video.save();
  res.json({ bookmarked });
};

// POST /videos/:id/comments  🔒
const addComment = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text is required' });

  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: 'Video not found' });

  video.comments.push({ user: req.user.id, text });
  video.commentCount = video.comments.length;
  await video.save();

  const newComment = video.comments[video.comments.length - 1];
  res.status(201).json({
    _id:       newComment._id,
    user:      req.user.id,
    text:      newComment.text,
    createdAt: newComment.createdAt,
    updatedAt: newComment.updatedAt,
  });
};

module.exports = {
  getVideos, getBookmarks, getVideo, getComments,
  createVideo, updateVideo, deleteVideo,
  toggleLike, toggleBookmark, addComment,
};
