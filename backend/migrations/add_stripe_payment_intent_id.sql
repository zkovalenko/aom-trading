-- Add stripe_payment_intent_id column to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id 
ON payments(stripe_payment_intent_id);