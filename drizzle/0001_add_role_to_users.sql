-- Migration to add role column to users table

-- Create the enum type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager', 'viewer');
    END IF;
END
$$;

-- Add the role column to the users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;