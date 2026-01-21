# Database Migrations

This document explains how to apply database migrations for the Lunr application.

## Migration Files

The following migration files need to be applied:

1. `supabase/migrations/add_api_keys.sql` - Creates API keys table
2. `supabase/migrations/add_webhooks_and_api_usage.sql` - Creates webhooks and API usage tables

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open each migration file and copy its contents
4. Paste the SQL into the SQL Editor
5. Click **Run** to execute the migration
6. Repeat for each migration file in order

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project root
cd /path/to/lunr

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Combined Migration Script

You can also apply both migrations at once:

```bash
# Combine migrations
cat supabase/migrations/add_api_keys.sql \
    supabase/migrations/add_webhooks_and_api_usage.sql > combined_migration.sql

# Then run the combined_migration.sql in Supabase SQL Editor
```

## Verification

After applying migrations, verify they were successful:

1. In Supabase Dashboard, go to **Table Editor**
2. Verify the following tables exist:
   - `api_keys`
   - `webhooks`
   - `api_usage`

3. Check that Row Level Security (RLS) is enabled on all tables

## Migration Order

Migrations should be applied in this order:

1. `add_api_keys.sql` (must be first, as `api_usage` references `api_keys`)
2. `add_webhooks_and_api_usage.sql`

## Troubleshooting

### Error: "relation already exists"

If you see this error, the table may already exist. You can either:
- Skip the migration if the table structure matches
- Drop the table and re-run the migration (⚠️ **WARNING**: This will delete data)

### Error: "permission denied"

Make sure you're using a user with sufficient permissions. In Supabase Dashboard, you should have admin access.

### RLS Policies Not Created

If RLS policies fail to create, you can manually enable RLS:

```sql
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
```

Then re-run the policy creation statements from the migration files.

## Next Steps

After applying migrations:

1. Test API key creation in Settings → API Keys
2. Test webhook creation via API
3. Verify API usage tracking is working
4. Check that all API endpoints are functioning correctly

