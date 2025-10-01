import express from 'express';
import { download } from '../controllers/softwareDownloadController';
import { authenticateToken } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';

const router = express.Router();

/**
 * @route POST /download
 * @desc start Software Download
 * @body {fileId, fileName} - fileId is the google drive id
 */
router.post('/', authenticateToken, requireActiveSubscription, download);


export default router;
