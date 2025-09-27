import express from 'express';
import {
  getProducts,
  createSubscription,
  confirmSubscription,
  getUserSubscriptions,
  cancelSubscription
} from '../controllers/subscriptionController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all available products
router.get('/products', getProducts);

// Create subscription payment intent
router.post('/create', authenticateToken, createSubscription);

// Confirm subscription payment
router.post('/confirm', authenticateToken, confirmSubscription);

// Get user's subscriptions
router.get('/my-subscriptions', authenticateToken, getUserSubscriptions);

// Cancel subscription
router.post('/cancel', authenticateToken, cancelSubscription);

export default router;