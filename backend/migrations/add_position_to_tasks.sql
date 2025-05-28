-- Add position column to tasks table
ALTER TABLE tasks ADD COLUMN position INTEGER;

-- Update existing tasks with sequential positions
WITH numbered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM tasks
)
UPDATE tasks
SET position = numbered_tasks.row_num
FROM numbered_tasks
WHERE tasks.id = numbered_tasks.id;

-- Make position column NOT NULL after populating it
ALTER TABLE tasks ALTER COLUMN position SET NOT NULL;

-- Add unique constraint to position
ALTER TABLE tasks ADD CONSTRAINT tasks_position_unique UNIQUE (position); 