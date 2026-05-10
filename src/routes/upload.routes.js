const { Router }        = require('express');
const { getPresignedUrl } = require('../controllers/upload.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.post('/presigned-url', authenticate, authorize('instructor'), getPresignedUrl);

module.exports = router;
