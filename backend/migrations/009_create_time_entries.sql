-- Create time entries table
CREATE TABLE time_entries (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER NOT NULL, -- in minutes
    description TEXT,
    is_running BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_time_entries_is_running ON time_entries(is_running);

-- Add comment to explain the table
COMMENT ON TABLE time_entries IS 'Stores time tracking entries for tasks';

-- Add time tracking columns to tasks table
ALTER TABLE tasks
ADD COLUMN estimated_time INTEGER, -- in minutes
ADD COLUMN actual_time INTEGER; -- in minutes 