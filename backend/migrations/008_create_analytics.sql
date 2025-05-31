-- Create analytics tables
CREATE TABLE task_analytics (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    time_spent INTEGER DEFAULT 0, -- in minutes
    completion_time TIMESTAMP WITH TIME ZONE,
    status_changes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    attachment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_created INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in minutes
    average_completion_time INTEGER DEFAULT 0, -- in minutes
    productivity_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

CREATE TABLE project_analytics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    active_tasks INTEGER DEFAULT 0,
    total_members INTEGER DEFAULT 0,
    average_completion_time INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_task_analytics_task_id ON task_analytics(task_id);
CREATE INDEX idx_task_analytics_user_id ON task_analytics(user_id);
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_date ON user_analytics(date);
CREATE INDEX idx_project_analytics_project_id ON project_analytics(project_id);
CREATE INDEX idx_project_analytics_date ON project_analytics(date);

-- Add comments to explain the tables
COMMENT ON TABLE task_analytics IS 'Stores analytics data for individual tasks';
COMMENT ON TABLE user_analytics IS 'Stores daily analytics data for users';
COMMENT ON TABLE project_analytics IS 'Stores daily analytics data for projects'; 