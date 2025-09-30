ALTER TABLE users 
ADD COLUMN IF NOT EXISTS methodology_disclaimer_viewed BOOLEAN DEFAULT FALSE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS methodology_disclaimer_viewed_date TIMESTAMP;
