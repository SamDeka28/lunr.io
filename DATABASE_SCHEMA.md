# Database Schema Documentation

## Overview

This application uses Supabase for authentication and database management. The schema is designed to track users, their plans, subscriptions, and usage.

## Tables

### 1. `auth.users` (Supabase Managed)
**Base user table managed by Supabase Auth**
- `id` (UUID) - Primary key
- `email` - User email
- `created_at` - Account creation timestamp
- Other auth-related fields managed by Supabase

**Note:** This table is automatically created and managed by Supabase. We don't create it manually.

### 2. `profiles` (Extends auth.users)
**User profile information and current subscription**

Stores additional user data and the **active/current plan subscription**:

- `id` (UUID) - References `auth.users(id)` (one-to-one relationship)
- `email` - User email (synced from auth.users)
- `full_name` - User's full name
- `avatar_url` - Profile picture URL
- `company_name` - Company name (optional)

**Current Plan Subscription:**
- `plan_id` - References `plans(id)` - **Current active plan**
- `plan_started_at` - When current plan started
- `plan_expires_at` - When current plan expires (null for lifetime)

**Stripe Integration:**
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Current Stripe subscription ID

**Usage Tracking:**
- `usage_links` - Current count of active links
- `usage_qr_codes` - Current count of active QR codes
- `usage_reset_at` - When usage counters reset (monthly)

**Timestamps:**
- `created_at` - Profile creation
- `updated_at` - Last update

### 3. `subscriptions` (Subscription History)
**Detailed subscription history and tracking**

Tracks all subscription changes and history:

- `id` (UUID) - Primary key
- `user_id` - References `auth.users(id)`
- `plan_id` - References `plans(id)`
- `status` - `active`, `cancelled`, `expired`, `trial`
- `started_at` - When subscription started
- `expires_at` - When subscription expires
- `cancelled_at` - When subscription was cancelled
- `stripe_subscription_id` - Stripe subscription ID
- `stripe_price_id` - Stripe price ID
- `billing_cycle` - `monthly` or `yearly`
- `created_at` - Record creation
- `updated_at` - Last update

**Use Case:** Track subscription history, upgrades, downgrades, cancellations

### 4. `plans` (Subscription Plans)
**Available subscription plans**

- `id` (UUID) - Primary key
- `name` - Unique plan identifier (e.g., 'free', 'pro', 'business')
- `display_name` - Human-readable name
- `description` - Plan description
- `price_monthly` - Monthly price
- `price_yearly` - Yearly price
- `max_links` - Maximum links allowed (-1 for unlimited)
- `max_qr_codes` - Maximum QR codes allowed (-1 for unlimited)
- `features` - JSONB object with feature flags
- `is_active` - Whether plan is available
- `created_at` - Plan creation
- `updated_at` - Last update

### 5. `links` (Shortened Links)
**User's shortened links**

- `id` (UUID) - Primary key
- `short_code` - Unique short code (2-20 characters)
- `original_url` - Original destination URL
- `title` - Link title (optional)
- `user_id` - References `auth.users(id)` (null for anonymous)
- `is_active` - Whether link is active
- `click_count` - Total clicks
- `expires_at` - Expiration date (optional)
- `password_hash` - Password hash (optional)
- `created_at` - Creation timestamp

### 6. `qr_codes` (QR Codes)
**User's QR codes**

- `id` (UUID) - Primary key
- `user_id` - References `auth.users(id)`
- `link_id` - References `links(id)` (optional)
- `qr_data` - QR code data URL
- `is_active` - Whether QR code is active
- `created_at` - Creation timestamp

### 7. `analytics` (Click Analytics)
**Link click tracking**

- `id` (UUID) - Primary key
- `link_id` - References `links(id)`
- `clicked_at` - Click timestamp
- `ip_address` - Clicker's IP
- `user_agent` - Browser user agent
- `referrer` - Referrer URL
- `country` - Country code

## Relationships

```
auth.users (1) ──< (1) profiles
auth.users (1) ──< (*) links
auth.users (1) ──< (*) qr_codes
auth.users (1) ──< (*) subscriptions

plans (1) ──< (*) profiles (current plan)
plans (1) ──< (*) subscriptions

links (1) ──< (*) analytics
links (1) ──< (*) qr_codes
```

## Plan Subscription Storage

**Current Active Plan:**
- Stored in `profiles.plan_id` (the active plan the user is currently on)
- `profiles.plan_started_at` - When they started this plan
- `profiles.plan_expires_at` - When it expires

**Subscription History:**
- All subscription changes are tracked in `subscriptions` table
- Each plan change creates a new subscription record
- Status field tracks: active, cancelled, expired, trial

## Usage Tracking

Usage is automatically tracked via database triggers:
- When a link is created → `profiles.usage_links` increments
- When a link is deleted → `profiles.usage_links` decrements
- When a QR code is created → `profiles.usage_qr_codes` increments
- When a QR code is deleted → `profiles.usage_qr_codes` decrements

## Automatic Profile Creation

When a new user signs up via Supabase Auth:
1. User is created in `auth.users` (Supabase)
2. Trigger `on_auth_user_created` fires
3. Profile is automatically created in `profiles` table
4. Free plan is automatically assigned

