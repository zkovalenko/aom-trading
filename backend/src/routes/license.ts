import express from 'express';
import { validateLicense, releaseDevice } from '../controllers/licenseController';
import { authenticateApiKey } from '../middleware/apiKeyAuth';

const router = express.Router();

/**
 * @route POST /api/license/validate
 * @desc Validate a software license using user_subscriptions
 * @access Private (API Key required)
 * @body {email, productNumber, deviceId}
 */
router.post('/validate', authenticateApiKey, validateLicense);

/**
 * @route POST /api/license/releaseDevice
 * @desc Release a device from a software license
 * @access Private (API Key required)
 * @body {email, productNumber, deviceId}
 */
router.post('/releaseDevice', authenticateApiKey, releaseDevice);

export default router;