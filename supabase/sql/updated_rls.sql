-- Updated Row Level Security (RLS) policies for FILOG Finance App
-- This ensures all data is properly scoped to authenticated users

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Accounts policies
CREATE POLICY "Users can view their own accounts" ON accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" ON accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Holdings policies
CREATE POLICY "Users can view their own holdings" ON holdings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings" ON holdings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings" ON holdings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own holdings" ON holdings
    FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view their own budgets" ON budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Assets and Liabilities policies
CREATE POLICY "Users can view their own assets and liabilities" ON assets_liabilities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets and liabilities" ON assets_liabilities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets and liabilities" ON assets_liabilities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets and liabilities" ON assets_liabilities
    FOR DELETE USING (auth.uid() = user_id);

-- Import Jobs policies
CREATE POLICY "Users can view their own import jobs" ON import_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own import jobs" ON import_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import jobs" ON import_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own import jobs" ON import_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Additional policies for better data integrity

-- Prevent users from creating transactions for accounts they don't own
CREATE POLICY "Users can only create transactions for their own accounts" ON transactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND user_id = auth.uid())
    );

-- Prevent users from creating budgets for categories they don't own
CREATE POLICY "Users can only create budgets for their own categories" ON budgets
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        EXISTS (SELECT 1 FROM categories WHERE id = category_id AND user_id = auth.uid())
    );

-- Prevent users from creating holdings for accounts they don't own (if account_id is provided)
CREATE POLICY "Users can only create holdings for their own accounts" ON holdings
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        (account_id IS NULL OR EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND user_id = auth.uid()))
    );

-- Ensure transaction category belongs to the user (if category_id is provided)
CREATE POLICY "Users can only use their own categories in transactions" ON transactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        (category_id IS NULL OR EXISTS (SELECT 1 FROM categories WHERE id = category_id AND user_id = auth.uid()))
    );

-- Create a function to get user's net worth (for dashboard calculations)
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

-- Create a function to get user's budget spending (for budget tracking)
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_net_worth(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_budget_spending(UUID, DATE, DATE) TO authenticated;
