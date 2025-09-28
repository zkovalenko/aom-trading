import { Router } from 'express';
import { submitSupportRequest } from '../controllers/supportController';

const router = Router();

router.post('/contact', submitSupportRequest);

export default router;
