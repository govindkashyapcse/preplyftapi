const { Router } = require('express');
const {
  getChannels, getMyChannels, getChannel,
  createChannel, updateChannel, toggleSubscribe,
} = require('../controllers/channel.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get( '/',                getChannels);
router.get( '/mine',            authenticate, authorize('instructor'), getMyChannels);
router.get( '/:id',             getChannel);
router.post('/',                authenticate, createChannel);
router.patch('/:id',            authenticate, authorize('instructor'), updateChannel);
router.post('/:id/subscribe',   authenticate, toggleSubscribe);

module.exports = router;
