import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';
import { getActiveMeetings } from '../controllers/meetingController';

const router = Router();

router.get('/', authenticateToken, requireActiveSubscription, getActiveMeetings);

export default router;
