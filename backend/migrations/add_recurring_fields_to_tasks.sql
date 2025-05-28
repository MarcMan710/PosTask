-- Add recurring task fields to tasks table
ALTER TABLE tasks 
ADD COLUMN is_recurring BOOLEAN DEFAULT false,
ADD COLUMN recurrence_pattern VARCHAR(50),
ADD COLUMN recurrence_interval INTEGER,
ADD COLUMN recurrence_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id); 