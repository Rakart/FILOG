-- Custom Migration Script for Existing FILOG Database
-- This script works with your current database structure

-- First, let's add missing columns to existing tables if they don't exist

-- Add updated_at column to existing tables if missing
DO $$ 
BEGIN
    -- Add updated_at to accounts if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'accounts' AND column_name = 'updated_at') THEN
        ALTER TABLE accounts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to categories if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
        ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to transactions if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'updated_at') THEN
        ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to holdings if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'holdings' AND column_name = 'updated_at') THEN
        ALTER TABLE holdings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at to import_jobs if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'import_jobs' AND column_name = 'updated_at') THEN
        ALTER TABLE import_jobs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create goals table (for financial goals tracking)
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    deadline DATE NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets_liabilities table (for net worth tracking)
CREATE TABLE IF NOT EXISTS assets_liabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability')),
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing budgets table to match our new structure
-- First, let's add the new columns we need
DO $$ 
BEGIN
    -- Add amount column to budgets if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'budgets' AND column_name = 'amount') THEN
        ALTER TABLE budgets ADD COLUMN amount DECIMAL(15,2);
    END IF;
    
    -- Add period column to budgets if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'budgets' AND column_name = 'period') THEN
        ALTER TABLE budgets ADD COLUMN period VARCHAR(20) CHECK (period IN ('monthly', 'yearly'));
    END IF;
    
    -- Add updated_at to budgets if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'budgets' AND column_name = 'updated_at') THEN
        ALTER TABLE budgets ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
CREATE INDEX IF NOT EXISTS idx_assets_liabilities_user_id ON assets_liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_liabilities_type ON assets_liabilities(type);

-- Create indexes for existing tables if they don't exist
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_posted_at ON transactions(posted_at);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id ON import_jobs(user_id);

-- Enable RLS on all tables if not already enabled
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for existing tables (if they don't exist)
-- Accounts policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can view their own accounts') THEN
        CREATE POLICY "Users can view their own accounts" ON accounts
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can insert their own accounts') THEN
        CREATE POLICY "Users can insert their own accounts" ON accounts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can update their own accounts') THEN
        CREATE POLICY "Users can update their own accounts" ON accounts
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can delete their own accounts') THEN
        CREATE POLICY "Users can delete their own accounts" ON accounts
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Categories policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can view their own categories') THEN
        CREATE POLICY "Users can view their own categories" ON categories
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can insert their own categories') THEN
        CREATE POLICY "Users can insert their own categories" ON categories
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can update their own categories') THEN
        CREATE POLICY "Users can update their own categories" ON categories
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can delete their own categories') THEN
        CREATE POLICY "Users can delete their own categories" ON categories
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Transactions policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions') THEN
        CREATE POLICY "Users can view their own transactions" ON transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert their own transactions') THEN
        CREATE POLICY "Users can insert their own transactions" ON transactions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can update their own transactions') THEN
        CREATE POLICY "Users can update their own transactions" ON transactions
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can delete their own transactions') THEN
        CREATE POLICY "Users can delete their own transactions" ON transactions
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Holdings policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'holdings' AND policyname = 'Users can view their own holdings') THEN
        CREATE POLICY "Users can view their own holdings" ON holdings
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'holdings' AND policyname = 'Users can insert their own holdings') THEN
        CREATE POLICY "Users can insert their own holdings" ON holdings
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'holdings' AND policyname = 'Users can update their own holdings') THEN
        CREATE POLICY "Users can update their own holdings" ON holdings
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'holdings' AND policyname = 'Users can delete their own holdings') THEN
        CREATE POLICY "Users can delete their own holdings" ON holdings
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Budgets policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can view their own budgets') THEN
        CREATE POLICY "Users can view their own budgets" ON budgets
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can insert their own budgets') THEN
        CREATE POLICY "Users can insert their own budgets" ON budgets
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can update their own budgets') THEN
        CREATE POLICY "Users can update their own budgets" ON budgets
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budgets' AND policyname = 'Users can delete their own budgets') THEN
        CREATE POLICY "Users can delete their own budgets" ON budgets
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Budget items policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budget_items' AND policyname = 'Users can view their own budget items') THEN
        CREATE POLICY "Users can view their own budget items" ON budget_items
            FOR SELECT USING (
                EXISTS (SELECT 1 FROM budgets WHERE id = budget_id AND user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budget_items' AND policyname = 'Users can insert their own budget items') THEN
        CREATE POLICY "Users can insert their own budget items" ON budget_items
            FOR INSERT WITH CHECK (
                EXISTS (SELECT 1 FROM budgets WHERE id = budget_id AND user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budget_items' AND policyname = 'Users can update their own budget items') THEN
        CREATE POLICY "Users can update their own budget items" ON budget_items
            FOR UPDATE USING (
                EXISTS (SELECT 1 FROM budgets WHERE id = budget_id AND user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budget_items' AND policyname = 'Users can delete their own budget items') THEN
        CREATE POLICY "Users can delete their own budget items" ON budget_items
            FOR DELETE USING (
                EXISTS (SELECT 1 FROM budgets WHERE id = budget_id AND user_id = auth.uid())
            );
    END IF;
END $$;

-- Goals policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can view their own goals') THEN
        CREATE POLICY "Users can view their own goals" ON goals
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can insert their own goals') THEN
        CREATE POLICY "Users can insert their own goals" ON goals
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can update their own goals') THEN
        CREATE POLICY "Users can update their own goals" ON goals
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'goals' AND policyname = 'Users can delete their own goals') THEN
        CREATE POLICY "Users can delete their own goals" ON goals
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Assets and Liabilities policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets_liabilities' AND policyname = 'Users can view their own assets and liabilities') THEN
        CREATE POLICY "Users can view their own assets and liabilities" ON assets_liabilities
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets_liabilities' AND policyname = 'Users can insert their own assets and liabilities') THEN
        CREATE POLICY "Users can insert their own assets and liabilities" ON assets_liabilities
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets_liabilities' AND policyname = 'Users can update their own assets and liabilities') THEN
        CREATE POLICY "Users can update their own assets and liabilities" ON assets_liabilities
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets_liabilities' AND policyname = 'Users can delete their own assets and liabilities') THEN
        CREATE POLICY "Users can delete their own assets and liabilities" ON assets_liabilities
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Import jobs policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_jobs' AND policyname = 'Users can view their own import jobs') THEN
        CREATE POLICY "Users can view their own import jobs" ON import_jobs
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_jobs' AND policyname = 'Users can insert their own import jobs') THEN
        CREATE POLICY "Users can insert their own import jobs" ON import_jobs
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_jobs' AND policyname = 'Users can update their own import jobs') THEN
        CREATE POLICY "Users can update their own import jobs" ON import_jobs
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_jobs' AND policyname = 'Users can delete their own import jobs') THEN
        CREATE POLICY "Users can delete their own import jobs" ON import_jobs
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Import rows policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_rows' AND policyname = 'Users can view their own import rows') THEN
        CREATE POLICY "Users can view their own import rows" ON import_rows
            FOR SELECT USING (
                EXISTS (SELECT 1 FROM import_jobs WHERE id = import_job_id AND user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_rows' AND policyname = 'Users can insert their own import rows') THEN
        CREATE POLICY "Users can insert their own import rows" ON import_rows
            FOR INSERT WITH CHECK (
                EXISTS (SELECT 1 FROM import_jobs WHERE id = import_job_id AND user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_rows' AND policyname = 'Users can update their own import rows') THEN
        CREATE POLICY "Users can update their own import rows" ON import_rows
            FOR UPDATE USING (
                EXISTS (SELECT 1 FROM import_jobs WHERE id = import_job_id AND user_id = auth.uid())
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'import_rows' AND policyname = 'Users can delete their own import rows') THEN
        CREATE POLICY "Users can delete their own import rows" ON import_rows
            FOR DELETE USING (
                EXISTS (SELECT 1 FROM import_jobs WHERE id = import_job_id AND user_id = auth.uid())
            );
    END IF;
END $$;

-- Profiles policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete their own profile') THEN
        CREATE POLICY "Users can delete their own profile" ON profiles
            FOR DELETE USING (auth.uid() = id);
    END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DO $$ 
BEGIN
    -- Accounts trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_accounts_updated_at') THEN
        CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Categories trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Transactions trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at') THEN
        CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Holdings trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_holdings_updated_at') THEN
        CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Budgets trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budgets_updated_at') THEN
        CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Goals trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_goals_updated_at') THEN
        CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Assets and Liabilities trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_liabilities_updated_at') THEN
        CREATE TRIGGER update_assets_liabilities_updated_at BEFORE UPDATE ON assets_liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Import jobs trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_import_jobs_updated_at') THEN
        CREATE TRIGGER update_import_jobs_updated_at BEFORE UPDATE ON import_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create a function to automatically create a budget when a category is created
CREATE OR REPLACE FUNCTION create_budget_for_new_category()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a default monthly budget for the new category
    INSERT INTO budgets (user_id, period_start, period_end, amount, period)
    VALUES (
        NEW.user_id,
        DATE_TRUNC('month', CURRENT_DATE),
        (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE,
        0, -- Default amount of 0, user can update later
        'monthly'
    );
    
    -- Get the budget ID we just created
    DECLARE
        budget_id_var UUID;
    BEGIN
        SELECT id INTO budget_id_var 
        FROM budgets 
        WHERE user_id = NEW.user_id 
        AND period_start = DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Create a budget item for this category
        INSERT INTO budget_items (budget_id, category_id, amount)
        VALUES (budget_id_var, NEW.id, 0);
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create budget when category is created
CREATE TRIGGER create_budget_for_category_trigger
    AFTER INSERT ON categories
    FOR EACH ROW
    EXECUTE FUNCTION create_budget_for_new_category();

-- Create utility functions
CREATE OR REPLACE FUNCTION get_user_net_worth(user_uuid UUID)
RETURNS TABLE (
    total_assets DECIMAL,
    total_liabilities DECIMAL,
    net_worth DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'asset' THEN amount ELSE 0 END), 0) as total_assets,
        COALESCE(SUM(CASE WHEN type = 'liability' THEN amount ELSE 0 END), 0) as total_liabilities,
        COALESCE(SUM(CASE WHEN type = 'asset' THEN amount ELSE -amount END), 0) as net_worth
    FROM assets_liabilities 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_budget_spending(user_uuid UUID, start_date DATE, end_date DATE)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    budget_amount DECIMAL,
    spent_amount DECIMAL,
    remaining_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.category_id,
        c.name as category_name,
        bi.amount as budget_amount,
        COALESCE(SUM(ABS(t.amount)), 0) as spent_amount,
        bi.amount - COALESCE(SUM(ABS(t.amount)), 0) as remaining_amount
    FROM budgets b
    JOIN budget_items bi ON bi.budget_id = b.id
    JOIN categories c ON c.id = bi.category_id
    LEFT JOIN transactions t ON t.category_id = bi.category_id 
        AND t.user_id = user_uuid 
        AND t.posted_at BETWEEN start_date AND end_date
        AND t.amount < 0 -- only count expenses
    WHERE b.user_id = user_uuid
    GROUP BY bi.category_id, c.name, bi.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_net_worth(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_budget_spending(UUID, DATE, DATE) TO authenticated;

-- Add comments
COMMENT ON TABLE goals IS 'Financial goals with progress tracking';
COMMENT ON TABLE assets_liabilities IS 'Assets and liabilities for net worth calculation';
COMMENT ON TABLE budgets IS 'Budget periods with associated budget items';
COMMENT ON TABLE budget_items IS 'Individual budget items by category within a budget period';
