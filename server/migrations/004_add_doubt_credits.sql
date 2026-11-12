-- ===================================================================
-- Migration 004: Add Doubt Credits, Doubt Tickets & Transactions
-- ===================================================================

-- 1. Extend user_rewards with doubt balance and usage counters
ALTER TABLE user_rewards ADD COLUMN IF NOT EXISTS doubt_credits INTEGER NOT NULL DEFAULT 10;
ALTER TABLE user_rewards ADD COLUMN IF NOT EXISTS free_doubts_total INTEGER NOT NULL DEFAULT 10;
ALTER TABLE user_rewards ADD COLUMN IF NOT EXISTS doubts_used INTEGER NOT NULL DEFAULT 0;

-- 2. Create Doubt Tickets Table
-- Tracks student doubts through the pending -> solved lifecycle.
-- Crucial Rule: Doubt count is ONLY deducted when status transitions to 'solved'!
CREATE TABLE IF NOT EXISTS doubt_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  section_number VARCHAR(50),
  section_title VARCHAR(255),
  lesson_name VARCHAR(255),
  topic_number VARCHAR(50),
  step_name VARCHAR(255),
  question TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'solved', 'dismissed'
  resolution_notes TEXT DEFAULT NULL,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doubt_tickets_user_id ON doubt_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_tickets_status ON doubt_tickets(status);
CREATE INDEX IF NOT EXISTS idx_doubt_tickets_created_at ON doubt_tickets(created_at DESC);

-- 3. Create Doubt Audit / Transactions Table for payments and history
CREATE TABLE IF NOT EXISTS doubt_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES doubt_tickets(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'resolved_use', 'purchase_single', 'purchase_pack'
  amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  credits_change INTEGER NOT NULL, -- -1 for solved, +1 or +N for purchase
  credits_after INTEGER NOT NULL,
  payment_method VARCHAR(50) DEFAULT NULL, -- 'free', 'upi', 'card', 'mock'
  payment_reference VARCHAR(100) DEFAULT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doubt_transactions_user_id ON doubt_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_transactions_created_at ON doubt_transactions(created_at DESC);
