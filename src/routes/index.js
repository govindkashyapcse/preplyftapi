const { Router }  = require('express');
const authRoutes     = require('./auth.routes');
const uploadRoutes   = require('./upload.routes');
const channelRoutes  = require('./channel.routes');
const videoRoutes    = require('./video.routes');
const courseRoutes   = require('./course.routes');
const playlistRoutes = require('./playlist.routes');

const router = Router();

router.use('/auth',      authRoutes);
router.use('/upload',    uploadRoutes);
router.use('/channels',  channelRoutes);
router.use('/videos',    videoRoutes);
router.use('/courses',   courseRoutes);
router.use('/playlists', playlistRoutes);

module.exports = router;
