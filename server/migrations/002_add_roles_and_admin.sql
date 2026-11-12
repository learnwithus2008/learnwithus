-- ===================================================================
-- Migration 002: Add role and account_status to users
-- ===================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);

-- Elevate default admin users so administrators can test the admin panel immediately
UPDATE users 
SET role = 'admin' 
WHERE LOWER(email) IN ('ravi@gmail.com', 'admin@example.com', 'admin@pythonlearning.com');
