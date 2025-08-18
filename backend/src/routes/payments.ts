import express from 'express';
import { 
  createPaymentIntent, 
  confirmPayment, 
  getPaymentHistory, 
  handleStripeWebhook 
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Stripe webhook (must be before express.json() middleware)
router.post('/stripe-webhook', handleStripeWebhook);

// Create payment intent for course purchase
router.post('/create-intent', authenticateToken, createPaymentIntent);

// Confirm payment and grant course access
router.post('/confirm', authenticateToken, confirmPayment);

// Get user's payment history
router.get('/history', authenticateToken, getPaymentHistory);

// Get payment status by payment intent ID
router.get('/status/:paymentIntentId', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
      return;
    }

    // Get payment from database
    const pool = require('../config/database').default;
    const currentUser = req.user as any; // Type assertion
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = $1 AND user_id = $2',
      [paymentIntentId, currentUser?.id]
    );

    if (paymentResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }

    const payment = paymentResult.rows[0];

    res.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          courseId: payment.course_id,
          paymentIntentId: payment.stripe_payment_intent_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
});

export default router;