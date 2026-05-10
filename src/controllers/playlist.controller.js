const Playlist = require('../models/Playlist');

// GET /playlists  🔒
const getPlaylists = async (req, res) => {
  const playlists = await Playlist.find({ user: req.user.id })
    .populate('videos', 'title thumbnail duration')
    .sort({ createdAt: -1 });
  res.json(playlists);
};

// GET /playlists/:id
const getPlaylist = async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('videos', 'title thumbnail duration channel');
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

  const isOwner = req.user && playlist.user._id.toString() === req.user.id;
  if (!playlist.isPublic && !isOwner) {
    return res.status(403).json({ message: 'This playlist is private' });
  }
  res.json(playlist);
};

// POST /playlists  🔒
const createPlaylist = async (req, res) => {
  const { name, isPublic } = req.body;
  if (!name) return res.status(400).json({ message: 'Playlist name is required' });

  const playlist = await Playlist.create({ name, isPublic: isPublic ?? false, user: req.user.id });
  res.status(201).json(playlist);
};

// PATCH /playlists/:id  🔒
const updatePlaylist = async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
  if (playlist.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not your playlist' });

  const { name, isPublic } = req.body;
  if (name     !== undefined) playlist.name     = name;
  if (isPublic !== undefined) playlist.isPublic = isPublic;
  await playlist.save();
  res.json(playlist);
};

// DELETE /playlists/:id  🔒
const deletePlaylist = async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
  if (playlist.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not your playlist' });
  await playlist.deleteOne();
  res.json({ message: 'Playlist deleted' });
};

// POST /playlists/:id/videos  🔒
const addVideoToPlaylist = async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ message: 'videoId is required' });

  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
  if (playlist.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not your playlist' });
  if (playlist.videos.some((v) => v.toString() === videoId)) {
    return res.status(409).json({ message: 'Video already in playlist' });
  }

  playlist.videos.push(videoId);
  await playlist.save();
  const updated = await Playlist.findById(playlist._id).populate('videos', 'title thumbnail duration');
  res.json(updated);
};

// DELETE /playlists/:id/videos/:videoId  🔒
const removeVideoFromPlaylist = async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
  if (playlist.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not your playlist' });

  playlist.videos = playlist.videos.filter((v) => v.toString() !== req.params.videoId);
  await playlist.save();
  const updated = await Playlist.findById(playlist._id).populate('videos', 'title thumbnail duration');
  res.json(updated);
};

module.exports = {
  getPlaylists, getPlaylist, createPlaylist,
  updatePlaylist, deletePlaylist,
  addVideoToPlaylist, removeVideoFromPlaylist,
};
