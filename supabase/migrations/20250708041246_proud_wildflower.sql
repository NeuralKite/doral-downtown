/*
  # Fix user_profiles table nullable columns

  1. Schema Changes
    - Make `name` column nullable (can be updated after registration)
    - Make `business_name` column nullable (only needed for business users)
    - Make `business_description` column nullable (only needed for business users)
    - Make `business_address` column nullable (only needed for business users)
    - Make `business_website` column nullable (only needed for business users)

  2. Reasoning
    - The database trigger `handle_new_user` is failing because it cannot provide values for NOT NULL columns
    - These columns should be optional during initial registration and can be filled later
    - Business-related fields should only be required for users with 'business' role
*/

-- Make name column nullable (can be provided during registration or updated later)
ALTER TABLE user_profiles ALTER COLUMN name DROP NOT NULL;

-- Make business-related columns nullable (only needed for business users)
ALTER TABLE user_profiles ALTER COLUMN business_name DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_description DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_address DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN business_website DROP NOT NULL;