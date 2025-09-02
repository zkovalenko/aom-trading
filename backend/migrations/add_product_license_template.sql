-- Add product_license_template column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_license_template TEXT;

-- Add index for better query performance if needed
CREATE INDEX IF NOT EXISTS idx_products_license_template 
ON products(product_license_template);