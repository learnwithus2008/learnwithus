-- ===================================================================
-- Migration 005: Monetization System (Certificates, Paid Doubts & Payments)
-- ===================================================================

-- 1. Extend doubt_tickets table for code snippets, screenshots, and paid status
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS code_snippet TEXT DEFAULT NULL;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS screenshot_url TEXT DEFAULT NULL;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'free'; -- 'free', 'pending', 'verified', 'rejected'
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100) DEFAULT NULL;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS answer TEXT DEFAULT NULL;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS answered_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE doubt_tickets ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create Certificate Requests Table
CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  course_id VARCHAR(100) NOT NULL DEFAULT 'python-mastery',
  course_name VARCHAR(255) NOT NULL DEFAULT 'Python Programming & Adaptive Core Curriculum',
  completion_status VARCHAR(50) NOT NULL DEFAULT 'completed',
  completed_topics_count INTEGER NOT NULL DEFAULT 0,
  amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  payment_reference VARCHAR(100) DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_req_user_id ON certificate_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_req_status ON certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_cert_req_payment_status ON certificate_requests(payment_status);

-- 3. Create Issued Certificates Table
CREATE TABLE IF NOT EXISTS issued_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. LWU-PY-2026-XXXXXX
  request_id UUID REFERENCES certificate_requests(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  course_id VARCHAR(100) NOT NULL DEFAULT 'python-mastery',
  course_name VARCHAR(255) NOT NULL DEFAULT 'Python Programming & Adaptive Core Curriculum',
  completion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_url TEXT DEFAULT NULL,
  issued_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_reason TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issued_certs_cert_id ON issued_certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_issued_certs_user_id ON issued_certificates(user_id);

-- 4. Create Consolidated Payment Records Table
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_type VARCHAR(50) NOT NULL, -- 'certificate', 'paid_doubt'
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reference_id VARCHAR(100) NOT NULL, -- links to certificate_request.id or doubt_ticket.id
  amount_inr NUMERIC(10, 2) NOT NULL, -- 99.00 or 49.00
  payment_method VARCHAR(50) DEFAULT 'whatsapp_manual',
  transaction_reference VARCHAR(100) DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payment_records(created_at DESC);

