-- Drop existing triggers
DROP TRIGGER IF EXISTS notify_admins_new_task_trigger ON repair_tasks;
DROP TRIGGER IF EXISTS notify_status_change_trigger ON repair_tasks;

-- Drop trigger functions
DROP FUNCTION IF EXISTS notify_admins_new_task();
DROP FUNCTION IF EXISTS notify_status_change();