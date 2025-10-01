import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getCourseProgress, markLessonComplete, markQuizComplete } from '../controllers/courseProgressController';

const router = Router();

router.use(authenticateToken);

router.get('/', getCourseProgress);
router.post('/lessons/complete', markLessonComplete);
router.post('/quizzes/complete', markQuizComplete);

export default router;
