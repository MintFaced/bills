# SubSucker Setup Guide

Quick setup guide to get your development environment running.

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase (5 minutes)

### Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: `subsucker` (or your choice)
   - **Database Password**: Create a strong password and save it
   - **Region**: Choose closest to NZ (Australia Southeast recommended)
4. Click "Create new project" and wait ~2 minutes

### Get API Keys
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Run Database Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy/paste contents of `supabase/migrations/20260107_initial_schema.sql`
4. Click "Run"
5. Repeat for `supabase/migrations/20260107_seed_vendors.sql`

### Set Up Storage
1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. **Name**: `csv-uploads`
4. **Public bucket**: OFF (private)
5. **File size limit**: 50 MB
6. Click "Create bucket"

### Configure Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be on by default)
3. Go to **Authentication** → **URL Configuration**
4. Add redirect URLs:
   - `http://localhost:3000/app/onboarding` (development)
   - Your production URL when deployed

## 3. Set Up Resend (2 minutes)

### Create Account
1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email

### Get API Key
1. Go to **API Keys** in dashboard
2. Click "Create API Key"
3. **Name**: `SubSucker Dev`
4. **Permission**: Full Access
5. Click "Create"
6. Copy the key → `RESEND_API_KEY`

### Set From Email
1. Go to **Domains**
2. For development: Use `onboarding@resend.dev` (free sandbox)
3. For production: Add your domain and verify DNS

Update `.env.local`:
```
RESEND_FROM_EMAIL=onboarding@resend.dev  # or your@domain.com
```

## 4. Configure Stripe (You already have this!)

You mentioned you have a Stripe account. Get these values:

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

(We'll add webhooks later when we build deposit flow)

## 5. Create .env.local

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your values:

```bash
# Supabase (from step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (from step 4)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=  # Leave blank for now

# Resend (from step 3)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# App Configuration (default values are fine)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SubSucker
NEXT_PUBLIC_DEPOSIT_FULL=9900
NEXT_PUBLIC_DEPOSIT_DISCOUNTED=4900
NEXT_PUBLIC_SUCCESS_FEE_PERCENTAGE=10
```

## 6. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

You should see the SubSucker landing page!

## 7. Test the Flow

1. **Sign Up**: Enter your email on landing page
2. **Check Email**: Click the magic link from Supabase
3. **Onboarding**: Answer the 5-6 questions
4. **Upload CSV**: Drop one of your sample CSVs (BNZ or SBS)
5. **See Results**: (We'll build this next!)

## Troubleshooting

### "Invalid API credentials"
- Double-check your Supabase URL and keys in `.env.local`
- Make sure you're using the **anon** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env.local`

### "Bucket not found" error on CSV upload
- Make sure you created the `csv-uploads` bucket in Supabase Storage
- Check it's set to **private** (not public)

### Magic link not working
- Check spam folder
- Make sure you added `http://localhost:3000/app/onboarding` to Supabase redirect URLs
- Look in Supabase **Authentication** → **Users** to see if user was created

### Database errors
- Make sure you ran BOTH migration files in order
- Check **Database** → **Tables** in Supabase - you should see 12 tables

## Next Steps

Once you have the basic flow working, we'll build:
1. Results page with hero number calculation
2. "Confirm vendors" micro-step
3. Deposit unlock flow
4. Stripe integration

Let me know if you hit any issues!
