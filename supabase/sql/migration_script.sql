-- Migration script to update existing FILOG database
-- Run this script to add new tables and columns to existing database

-- First, check if we need to add new columns to existing tables
-- Add category_id to transactions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'category_id') THEN
        ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
    END IF;
END $$;

-- Remove cost_basis and shares columns from transactions if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'transactions' AND column_name = 'cost_basis') THEN
        ALTER TABLE transactions DROP COLUMN cost_basis;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'transactions' AND column_name = 'shares') THEN
        ALTER TABLE transactions DROP COLUMN shares;
    END IF;
END $$;

-- Create new tables if they don't exist
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'yearly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, period)
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    deadline DATE NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets_liabilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability')),
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
CREATE INDEX IF NOT EXISTS idx_assets_liabilities_user_id ON assets_liabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_liabilities_type ON assets_liabilities(type);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id ON import_jobs(user_id);

-- Enable RLS on new tables
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
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

-- Import Jobs policies
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

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to new tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budgets_updated_at') THEN
        CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_goals_updated_at') THEN
        CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_assets_liabilities_updated_at') THEN
        CREATE TRIGGER update_assets_liabilities_updated_at BEFORE UPDATE ON assets_liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
    category_name VARCHAR,
    budget_amount DECIMAL,
    spent_amount DECIMAL,
    remaining_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.category_id,
        c.name as category_name,
        b.amount as budget_amount,
        COALESCE(SUM(ABS(t.amount)), 0) as spent_amount,
        b.amount - COALESCE(SUM(ABS(t.amount)), 0) as remaining_amount
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = user_uuid 
        AND t.posted_at BETWEEN start_date AND end_date
        AND t.amount < 0 -- only count expenses
    WHERE b.user_id = user_uuid
    GROUP BY b.category_id, c.name, b.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_net_worth(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_budget_spending(UUID, DATE, DATE) TO authenticated;

-- Add comments
COMMENT ON TABLE budgets IS 'Spending limits by category and time period';
COMMENT ON TABLE goals IS 'Financial goals with progress tracking';
COMMENT ON TABLE assets_liabilities IS 'Assets and liabilities for net worth calculation';
COMMENT ON TABLE import_jobs IS 'CSV import job tracking and status';
