# FILOG Database Schema

This directory contains the SQL schema and migration scripts for the FILOG Finance App.

## Files Overview

### 1. `updated_schema.sql`
Complete schema for a fresh database installation. Includes:
- All tables with proper relationships
- Indexes for performance
- Row Level Security (RLS) policies
- Utility functions
- Triggers for updated_at timestamps

### 2. `updated_rls.sql`
Row Level Security policies and utility functions. Use this if you only need to update RLS policies.

### 3. `migration_script.sql`
Migration script for existing databases. Safely adds new tables and columns without breaking existing data.

## Database Tables

### Core Tables
- **categories** - Income/expense categories for transaction classification
- **accounts** - Financial accounts (checking, savings, credit cards, etc.)
- **transactions** - Financial transactions with category classification
- **holdings** - Investment holdings and shares with cost basis tracking

### New Feature Tables
- **budgets** - Spending limits by category and time period
- **goals** - Financial goals with progress tracking
- **assets_liabilities** - Assets and liabilities for net worth calculation
- **import_jobs** - CSV import job tracking and status

## Setup Instructions

### For New Database (Fresh Install)
1. Run `updated_schema.sql` in your Supabase SQL editor
2. This will create all tables, indexes, RLS policies, and functions

### For Existing Database (Migration)
1. Run `migration_script.sql` in your Supabase SQL editor
2. This safely adds new tables and columns without affecting existing data

### For RLS Updates Only
1. Run `updated_rls.sql` in your Supabase SQL editor
2. This updates Row Level Security policies and utility functions

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Data integrity is maintained across related tables
- Proper authentication is required for all operations

### Utility Functions
- `get_user_net_worth(user_uuid)` - Calculate user's net worth
- `get_user_budget_spending(user_uuid, start_date, end_date)` - Track budget spending

### Data Integrity
- Foreign key constraints ensure data consistency
- Check constraints validate data types and values
- Unique constraints prevent duplicate budgets per category/period
- Triggers automatically update `updated_at` timestamps

## Environment Variables Required

Make sure these are set in your Supabase project:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Testing the Schema

After running the schema, you can test with these queries:

```sql
-- Test user data isolation
SELECT * FROM categories WHERE user_id = auth.uid();

-- Test net worth calculation
SELECT * FROM get_user_net_worth(auth.uid());

-- Test budget tracking
SELECT * FROM get_user_budget_spending(auth.uid(), '2024-01-01', '2024-12-31');
```

## Troubleshooting

### Common Issues
1. **RLS Policy Errors**: Ensure all policies are created and enabled
2. **Foreign Key Errors**: Check that referenced tables exist and have proper data
3. **Permission Errors**: Verify that authenticated users have proper permissions

### Verification Queries
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your Supabase project has the necessary permissions
4. Test with a fresh database using `updated_schema.sql`
