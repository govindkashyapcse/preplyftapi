const { Router } = require('express');
const {
  getPlaylists, getPlaylist, createPlaylist,
  updatePlaylist, deletePlaylist,
  addVideoToPlaylist, removeVideoFromPlaylist,
} = require('../controllers/playlist.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = Router();

router.get( '/',                       authenticate, getPlaylists);
router.get( '/:id',                    optionalAuth, getPlaylist);
router.post('/',                       authenticate, createPlaylist);
router.patch('/:id',                   authenticate, updatePlaylist);
router.delete('/:id',                  authenticate, deletePlaylist);
router.post('/:id/videos',             authenticate, addVideoToPlaylist);
router.delete('/:id/videos/:videoId',  authenticate, removeVideoFromPlaylist);

module.exports = router;
