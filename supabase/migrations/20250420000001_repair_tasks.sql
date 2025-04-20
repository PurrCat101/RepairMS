-- Create repair_tasks table
CREATE TABLE IF NOT EXISTS repair_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_name TEXT NOT NULL,
    issue TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'complete', 'incomplete')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    assigned_user_id UUID REFERENCES auth.users(id),
    spare_parts JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE TRIGGER update_repair_tasks_updated_at
    BEFORE UPDATE ON repair_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE repair_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage repair tasks"
    ON repair_tasks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Users can view repair tasks"
    ON repair_tasks
    FOR SELECT
    TO authenticated
    USING (
        assigned_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'officer')
        )
    );

CREATE POLICY "Officers can create repair tasks"
    ON repair_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'officer')
        )
    );

CREATE POLICY "Technicians can update assigned tasks"
    ON repair_tasks
    FOR UPDATE
    TO authenticated
    USING (
        assigned_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'officer')
        )
    );