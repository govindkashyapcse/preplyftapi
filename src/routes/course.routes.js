const { Router } = require('express');
const {
  getCourses, getEnrolledCourses, getCourse,
  createCourse, updateCourse, deleteCourse,
  addVideoToCourse, removeVideoFromCourse,
  enrollFree, initiatePayment, verifyPayment,
} = require('../controllers/course.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = Router();

router.get( '/',              getCourses);
router.get( '/user/enrolled', authenticate, getEnrolledCourses);
router.get( '/:id',           optionalAuth, getCourse);

router.post(  '/',    authenticate, authorize('instructor'), createCourse);
router.patch( '/:id', authenticate, authorize('instructor'), updateCourse);
router.delete('/:id', authenticate, authorize('instructor'), deleteCourse);

router.post(  '/:id/videos',          authenticate, authorize('instructor'), addVideoToCourse);
router.delete('/:id/videos/:videoId', authenticate, authorize('instructor'), removeVideoFromCourse);

router.post('/:id/enroll',        authenticate, enrollFree);
router.post('/:id/enroll/pay',    authenticate, initiatePayment);
router.post('/:id/enroll/verify', authenticate, verifyPayment);

module.exports = router;
