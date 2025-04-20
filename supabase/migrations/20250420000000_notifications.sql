-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'new_task', 'status_change', etc.
    read BOOLEAN DEFAULT false,
    task_id UUID REFERENCES repair_tasks(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create function to notify admins of new tasks
CREATE OR REPLACE FUNCTION notify_admins_new_task()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (recipient_id, title, message, type, task_id)
    SELECT 
        au.id,
        'งานซ่อมใหม่',
        'มีการเพิ่มงานซ่อมใหม่: ' || NEW.device_name || ' - ' || NEW.issue,
        'new_task',
        NEW.id
    FROM auth.users au
    WHERE au.raw_user_meta_data->>'role' = 'admin';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new task notifications
CREATE TRIGGER notify_admins_new_task_trigger
    AFTER INSERT ON repair_tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_task();

-- Create function to notify status changes
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('incomplete', 'complete') AND NEW.status != OLD.status THEN
        INSERT INTO notifications (recipient_id, title, message, type, task_id)
        SELECT 
            au.id,
            'สถานะงานเปลี่ยนแปลง',
            'งานซ่อม: ' || NEW.device_name || ' - ' || NEW.issue || ' มีการเปลี่ยนสถานะเป็น ' || 
            CASE 
                WHEN NEW.status = 'incomplete' THEN 'ไม่สำเร็จ'
                WHEN NEW.status = 'complete' THEN 'สำเร็จ'
            END,
            'status_change',
            NEW.id
        FROM auth.users au
        WHERE au.raw_user_meta_data->>'role' = 'admin';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for status change notifications
CREATE TRIGGER notify_status_change_trigger
    AFTER UPDATE OF status ON repair_tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_status_change();