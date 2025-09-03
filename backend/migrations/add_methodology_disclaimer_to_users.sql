ALTER TABLE users 
ADD COLUMN methodology_disclaimer_viewed BOOLEAN DEFAULT FALSE,
ADD COLUMN methodology_disclaimer_viewed_date TIMESTAMP;