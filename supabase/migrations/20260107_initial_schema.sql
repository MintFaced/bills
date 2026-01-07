-- SubSucker Database Schema
-- NZ Cost Reduction App for Manufacturers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT,
  staff_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

-- Sprints table (one per payment cycle)
CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sprint_id TEXT NOT NULL UNIQUE, -- Random ID shown on share cards
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled

  -- Onboarding answers
  primary_category TEXT NOT NULL DEFAULT 'marketing', -- marketing, software, telco, payments
  marketing_tools TEXT[], -- multi-select Q2
  payment_frequency TEXT, -- monthly, mix, annual, not_sure
  retention_priority BOOLEAN DEFAULT true,
  aggressiveness TEXT DEFAULT 'balanced', -- conservative, balanced, aggressive
  include_it_mobile BOOLEAN DEFAULT false,
  has_microsoft365 BOOLEAN,
  has_google_workspace BOOLEAN,
  has_cloud_storage BOOLEAN,

  -- Pricing
  deposit_amount INTEGER NOT NULL, -- in cents (9900 or 4900)
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,
  linkedin_discount BOOLEAN DEFAULT false,
  linkedin_post_url TEXT,

  -- Savings tracking
  potential_savings_annual INTEGER DEFAULT 0, -- in cents
  confirmed_savings_day31 INTEGER DEFAULT 0, -- in cents
  confirmed_savings_day90 INTEGER DEFAULT 0, -- in cents

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_refund_id TEXT,
  final_fee_charged INTEGER, -- in cents (10% of confirmed savings)

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  day31_checkpoint_at TIMESTAMPTZ,
  day90_checkpoint_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sprints_user_id ON public.sprints(user_id);
CREATE INDEX idx_sprints_sprint_id ON public.sprints(sprint_id);
CREATE INDEX idx_sprints_status ON public.sprints(status);

-- CSV Uploads table
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- File metadata
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL, -- S3/Supabase Storage path
  bank_name TEXT, -- ANZ, BNZ, SBS, etc.

  -- Processing
  upload_type TEXT NOT NULL, -- initial, day31, day90
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  transaction_count INTEGER DEFAULT 0,

  -- Column mapping (JSON)
  column_mapping JSONB, -- {date: 'Date', description: 'Description', amount: 'Amount'}

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uploads_sprint_id ON public.uploads(sprint_id);
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_upload_type ON public.uploads(upload_type);

-- Normalized Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,

  -- Transaction data
  transaction_date DATE NOT NULL,
  raw_description TEXT NOT NULL,
  normalized_description TEXT NOT NULL, -- cleaned, uppercased
  amount NUMERIC(12, 2) NOT NULL, -- absolute value in NZD
  transaction_type TEXT, -- debit, credit
  balance NUMERIC(12, 2),

  -- Merchant extraction
  merchant_candidate TEXT, -- extracted merchant name

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_upload_id ON public.transactions(upload_id);
CREATE INDEX idx_transactions_sprint_id ON public.transactions(sprint_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_merchant ON public.transactions(merchant_candidate);

-- Vendors table (normalized merchant entities)
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- canonical vendor name
  aliases TEXT[], -- known variations
  category TEXT, -- marketing, software, telco, payments, other
  known_saas BOOLEAN DEFAULT false,
  typical_frequency TEXT, -- monthly, annual
  supports_annual_discount BOOLEAN DEFAULT false,
  retention_discount_likely BOOLEAN DEFAULT false,
  bundle_includes TEXT[], -- for duplicate detection

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_name ON public.vendors(name);
CREATE INDEX idx_vendors_category ON public.vendors(category);

-- Vendor Charges table (detected recurring charges)
CREATE TABLE public.vendor_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,

  -- Detection
  merchant_candidate TEXT NOT NULL, -- from transactions
  raw_descriptions TEXT[], -- all matching transaction descriptions
  transaction_ids UUID[], -- references to transactions

  -- Frequency analysis
  frequency_type TEXT, -- weekly, fortnightly, monthly, annual, irregular
  frequency_days INTEGER, -- average days between charges
  baseline_monthly_cost NUMERIC(12, 2), -- normalized to monthly
  last_charge_date DATE,
  charge_count INTEGER DEFAULT 0,
  confidence_score NUMERIC(3, 2), -- 0.0 to 1.0

  -- Categorization (from user confirmation or auto-detection)
  category TEXT, -- marketing, software, telco, payments, other
  user_confirmed_category TEXT,
  priority TEXT, -- must_keep, nice_to_have, not_sure

  -- Savings opportunities
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES public.vendor_charges(id),
  monthly_to_annual_eligible BOOLEAN DEFAULT false,
  retention_discount_eligible BOOLEAN DEFAULT false,
  potential_savings_annual NUMERIC(12, 2) DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_charges_sprint_id ON public.vendor_charges(sprint_id);
CREATE INDEX idx_vendor_charges_vendor_id ON public.vendor_charges(vendor_id);
CREATE INDEX idx_vendor_charges_category ON public.vendor_charges(category);

-- Actions table (cancel/negotiate/switch recommendations)
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  vendor_charge_id UUID NOT NULL REFERENCES public.vendor_charges(id) ON DELETE CASCADE,

  -- Action details
  action_type TEXT NOT NULL, -- cancel, negotiate, annual_switch, duplicate_consolidate
  recommended BOOLEAN DEFAULT true,
  priority INTEGER, -- 1 = highest priority
  potential_savings_annual NUMERIC(12, 2),

  -- User interaction
  user_viewed BOOLEAN DEFAULT false,
  user_started BOOLEAN DEFAULT false,
  user_completed BOOLEAN DEFAULT false,
  outcome TEXT, -- tried, offered, accepted, declined, cancelled
  new_price NUMERIC(12, 2), -- if negotiated
  notes TEXT,

  -- Script/instructions
  script_email TEXT,
  script_chat TEXT,
  script_call TEXT,
  cancel_steps TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_actions_sprint_id ON public.actions(sprint_id);
CREATE INDEX idx_actions_vendor_charge_id ON public.actions(vendor_charge_id);
CREATE INDEX idx_actions_action_type ON public.actions(action_type);

-- Checkpoints table (Day 31/90 verification)
CREATE TABLE public.checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE SET NULL,

  checkpoint_type TEXT NOT NULL, -- day31, day90
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Savings verification
  confirmed_savings NUMERIC(12, 2) DEFAULT 0, -- in dollars
  vendors_cancelled INTEGER DEFAULT 0,
  vendors_negotiated INTEGER DEFAULT 0,
  vendors_pending INTEGER DEFAULT 0,

  -- Reminders sent
  reminder_sent_on_due BOOLEAN DEFAULT false,
  reminder_sent_plus2 BOOLEAN DEFAULT false,
  reminder_sent_plus4 BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checkpoints_sprint_id ON public.checkpoints(sprint_id);
CREATE INDEX idx_checkpoints_type ON public.checkpoints(checkpoint_type);
CREATE INDEX idx_checkpoints_due_date ON public.checkpoints(due_date);

-- Billing Events table (deposit, true-up, refunds)
CREATE TABLE public.billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL, -- deposit, refund, fee_charge, fee_credit
  amount INTEGER NOT NULL, -- in cents
  status TEXT NOT NULL, -- pending, succeeded, failed

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_refund_id TEXT,
  stripe_charge_id TEXT,

  -- Metadata
  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_billing_events_sprint_id ON public.billing_events(sprint_id);
CREATE INDEX idx_billing_events_user_id ON public.billing_events(user_id);
CREATE INDEX idx_billing_events_type ON public.billing_events(event_type);

-- Share Posts table (LinkedIn viral loop)
CREATE TABLE public.share_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  linkedin_post_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  discount_applied BOOLEAN DEFAULT false,

  -- Share card metadata
  potential_savings INTEGER, -- in cents
  subscriptions_found INTEGER,
  duplicates_flagged INTEGER,
  monthly_to_annual_wins INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_share_posts_sprint_id ON public.share_posts(sprint_id);

-- Leaderboard Aggregates table (privacy-safe stats)
CREATE TABLE public.leaderboard_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  period_type TEXT NOT NULL, -- daily, monthly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Aggregated stats (k-anonymized, minimum 12 participants)
  participant_count INTEGER DEFAULT 0,
  total_potential_savings NUMERIC(12, 2) DEFAULT 0,
  median_potential_savings NUMERIC(12, 2) DEFAULT 0,
  total_confirmed_savings NUMERIC(12, 2) DEFAULT 0,
  median_confirmed_savings NUMERIC(12, 2) DEFAULT 0,

  -- Category breakdown
  top_category_1 TEXT,
  top_category_1_count INTEGER,
  top_category_2 TEXT,
  top_category_2_count INTEGER,
  top_category_3 TEXT,
  top_category_3_count INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(period_type, period_start)
);

CREATE INDEX idx_leaderboard_period ON public.leaderboard_aggregates(period_type, period_start);

-- Data Deletion Requests table (audit trail)
CREATE TABLE public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed

  -- What was deleted
  sprints_deleted INTEGER DEFAULT 0,
  uploads_deleted INTEGER DEFAULT 0,
  transactions_deleted INTEGER DEFAULT 0
);

CREATE INDEX idx_deletion_requests_user_id ON public.deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON public.deletion_requests(status);

-- Row Level Security (RLS) Policies

-- Users can only see their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Sprints
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sprints" ON public.sprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sprints" ON public.sprints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sprints" ON public.sprints FOR UPDATE USING (auth.uid() = user_id);

-- Uploads
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own uploads" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT
  USING (sprint_id IN (SELECT id FROM public.sprints WHERE user_id = auth.uid()));

-- Vendor Charges
ALTER TABLE public.vendor_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vendor charges" ON public.vendor_charges FOR SELECT
  USING (sprint_id IN (SELECT id FROM public.sprints WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own vendor charges" ON public.vendor_charges FOR UPDATE
  USING (sprint_id IN (SELECT id FROM public.sprints WHERE user_id = auth.uid()));

-- Actions
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own actions" ON public.actions FOR SELECT
  USING (sprint_id IN (SELECT id FROM public.sprints WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own actions" ON public.actions FOR UPDATE
  USING (sprint_id IN (SELECT id FROM public.sprints WHERE user_id = auth.uid()));

-- Checkpoints
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checkpoints" ON public.checkpoints FOR SELECT
  USING (sprint_id IN (SELECT id FROM public.sprints WHERE user_id = auth.uid()));

-- Billing Events
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own billing events" ON public.billing_events FOR SELECT USING (auth.uid() = user_id);

-- Share Posts
ALTER TABLE public.share_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own share posts" ON public.share_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own share posts" ON public.share_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deletion Requests
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own deletion requests" ON public.deletion_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deletion requests" ON public.deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard is public (read-only)
ALTER TABLE public.leaderboard_aggregates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard is public" ON public.leaderboard_aggregates FOR SELECT TO PUBLIC USING (true);

-- Vendors table is public (read-only for users)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors are public" ON public.vendors FOR SELECT TO PUBLIC USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vendor_charges FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.actions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leaderboard_aggregates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
