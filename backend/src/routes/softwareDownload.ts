import express from 'express';
import { download } from '../controllers/softwareDownloadController';

const router = express.Router();

/**
 * @route POST /download
 * @desc start Software Download
 * @body {fileId, fileName} - fileId is the google drive id
 */
router.post('/', download);


export default router;
