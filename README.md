# SubSucker

**Stop bleeding cash on subscriptions you forgot about.**

A web app for NZ manufacturers (2–25 staff) to identify and eliminate subscription waste.

## ✅ Built So Far (Foundation Complete!)

### Core Engine
- ✅ CSV parser with flexible column mapping (ANZ, BNZ, SBS, generic)
- ✅ Transaction normalization + merchant extraction
- ✅ Recurring charge detector (weekly, monthly, annual)
- ✅ Duplicate subscription finder
- ✅ Savings calculator (conservative/balanced/aggressive)
- ✅ Confirmed savings verification logic

### Database
- ✅ Complete Supabase schema with RLS
- ✅ 100+ pre-seeded SaaS vendors
- ✅ Support for sprints, uploads, actions, checkpoints, billing
- ✅ Leaderboard aggregates (k-anonymized)

### UI
- ✅ Landing page with SubSucker branding (army green/khaki/lime)
- ✅ Magic link authentication
- ✅ Dark mode optimized

## 🚧 Still To Build

1. Onboarding flow (Q1-Q6 Marketing path)
2. CSV upload UI + column mapping
3. Results page + hero number
4. Stripe integration (deposits/refunds)
5. Playbook + Kiwi-casual scripts
6. Day 31/90 checkpoints
7. Email reminders (Resend)
8. LinkedIn share card generator
9. Leaderboard page
10. Delete data feature

## Getting Started

```bash
npm install
cp .env.example .env.local  # Fill in Supabase, Stripe, Resend keys
npm run dev
```

Run migrations in Supabase dashboard:
- `supabase/migrations/20260107_initial_schema.sql`
- `supabase/migrations/20260107_seed_vendors.sql`

## Tech Stack

- Next.js 15 + TypeScript
- Supabase (Postgres + Auth + Storage)
- Stripe (payments)
- Resend (email)
- Tailwind CSS v4

## How It Works

1. Upload bank CSV (free scan)
2. See potential savings hero number
3. Pay refundable deposit ($99 or $49 with LinkedIn share)
4. Get scripts + action plan
5. Day 31/90 checkpoints verify savings
6. We charge 10% fee, refund difference

Full refund if $0 confirmed savings.

## Need Sample CSVs

Upload test files from ANZ, BNZ, SBS to `samples/` directory for testing.
