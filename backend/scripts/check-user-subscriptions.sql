--- List tables
\dt public.*

-- Check user subscriptions for zhenya@minkovich.com

-- Get user ID first
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name
FROM users u 
WHERE u.email = 'zhenya@minkovich.com';

-- Get user subscriptions from user_subscriptions table
SELECT 
    us.user_id,
    us.subscriptions,
    us.license_number
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'zhenya@minkovich.com';

-- Get software licenses from software_licenses table
SELECT 
    sl.id,
    sl.user_id,
    sl.license_type,
    sl.product_number,
    sl.is_basic,
    sl.is_premium,
    sl.is_active,
    sl.expires_at,
    sl.purchased_at,
    sl.created_at
FROM software_licenses sl
JOIN users u ON sl.user_id = u.id
WHERE u.email = 'zhenya@minkovich.com';

-- Get payment history
SELECT 
    p.id,
    p.user_id,
    p.product_id,
    p.stripe_payment_intent_id,
    p.amount,
    p.currency,
    p.status,
    p.product_type,
    p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'zhenya@minkovich.com'
ORDER BY p.created_at DESC;