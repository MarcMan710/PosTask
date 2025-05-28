const db = require('../config/database');
const notificationService = require('../services/notificationService');

class Task {
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT t.*, 
          COALESCE(json_agg(json_build_object(
            'id', tag.id,
            'name', tag.name,
            'color', tag.color
          )) FILTER (WHERE tag.id IS NOT NULL), '[]') as tags
        FROM tasks t
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        LEFT JOIN tags tag ON tt.tag_id = tag.id
      `;

      const conditions = [];
      const values = [];
      let paramCount = 1;

      if (filters.keyword) {
        conditions.push(`(t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`);
        values.push(`%${filters.keyword}%`);
        paramCount++;
      }

      if (filters.status) {
        conditions.push(`t.status = $${paramCount}`);
        values.push(filters.status);
        paramCount++;
      }

      if (filters.priority) {
        conditions.push(`t.priority = $${paramCount}`);
        values.push(filters.priority);
        paramCount++;
      }

      if (filters.tags && filters.tags.length > 0) {
        conditions.push(`EXISTS (
          SELECT 1 FROM task_tags tt2
          WHERE tt2.task_id = t.id
          AND tt2.tag_id = ANY($${paramCount})
        )`);
        values.push(filters.tags);
        paramCount++;
      }

      if (filters.date) {
        conditions.push(`DATE(t.due_date) = $${paramCount}`);
        values.push(filters.date);
        paramCount++;
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY t.id ORDER BY t.position';

      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error in Task.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT t.*, 
          COALESCE(json_agg(json_build_object(
            'id', tag.id,
            'name', tag.name,
            'color', tag.color
          )) FILTER (WHERE tag.id IS NOT NULL), '[]') as tags
        FROM tasks t
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        LEFT JOIN tags tag ON tt.tag_id = tag.id
        WHERE t.id = $1
        GROUP BY t.id
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Task.findById:', error);
      throw error;
    }
  }

  static async create({ title, description, status, priority, tags, due_date, user_id, is_recurring, recurrence_pattern, recurrence_interval, recurrence_end_date }) {
    try {
      await db.query('BEGIN');

      // Get the next position
      const positionResult = await db.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM tasks'
      );
      const position = positionResult.rows[0].next_position;

      // Insert the task
      const taskQuery = `
        INSERT INTO tasks (
          title, description, status, priority, position, due_date,
          is_recurring, recurrence_pattern, recurrence_interval, recurrence_end_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const taskResult = await db.query(taskQuery, [
        title,
        description,
        status,
        priority,
        position,
        due_date,
        is_recurring || false,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date
      ]);
      const task = taskResult.rows[0];

      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagValues = tags.map(tagId => `(${task.id}, ${tagId})`).join(',');
        await db.query(`
          INSERT INTO task_tags (task_id, tag_id)
          VALUES ${tagValues}
        `);
      }

      await db.query('COMMIT');

      // Create notification if due_date is set
      if (due_date && user_id) {
        await notificationService.createTaskReminder(task, { id: user_id });
      }

      // If this is a recurring task, create the next occurrence
      if (is_recurring && recurrence_pattern && recurrence_interval) {
        await this.createNextRecurrence(task);
      }

      // Fetch the complete task with tags
      return this.findById(task.id);
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error in Task.create:', error);
      throw error;
    }
  }

  static async update(id, { title, description, status, priority, tags, due_date, user_id, is_recurring, recurrence_pattern, recurrence_interval, recurrence_end_date }) {
    try {
      await db.query('BEGIN');

      // Update the task
      const taskQuery = `
        UPDATE tasks
        SET title = $1,
            description = $2,
            status = $3,
            priority = $4,
            due_date = $5,
            is_recurring = $6,
            recurrence_pattern = $7,
            recurrence_interval = $8,
            recurrence_end_date = $9
        WHERE id = $10
        RETURNING *
      `;
      const taskResult = await db.query(taskQuery, [
        title,
        description,
        status,
        priority,
        due_date,
        is_recurring || false,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date,
        id
      ]);

      if (taskResult.rows.length === 0) {
        await db.query('ROLLBACK');
        return null;
      }

      const task = taskResult.rows[0];

      // Update tags if provided
      if (tags) {
        // Remove existing tags
        await db.query('DELETE FROM task_tags WHERE task_id = $1', [id]);

        // Add new tags
        if (tags.length > 0) {
          const tagValues = tags.map(tagId => `(${id}, ${tagId})`).join(',');
          await db.query(`
            INSERT INTO task_tags (task_id, tag_id)
            VALUES ${tagValues}
          `);
        }
      }

      await db.query('COMMIT');

      // Create notification if due_date is set and user_id is provided
      if (due_date && user_id) {
        await notificationService.createTaskReminder(task, { id: user_id });
      }

      // If this is a recurring task, create the next occurrence
      if (is_recurring && recurrence_pattern && recurrence_interval) {
        await this.createNextRecurrence(task);
      }

      // Fetch the complete task with tags
      return this.findById(id);
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error in Task.update:', error);
      throw error;
    }
  }

  static async createNextRecurrence(parentTask) {
    try {
      const nextDueDate = this.calculateNextDueDate(
        parentTask.due_date,
        parentTask.recurrence_pattern,
        parentTask.recurrence_interval
      );

      // Check if we've reached the end date
      if (parentTask.recurrence_end_date && nextDueDate > parentTask.recurrence_end_date) {
        return null;
      }

      // Create the next occurrence
      const nextTask = {
        title: parentTask.title,
        description: parentTask.description,
        status: 'pending',
        priority: parentTask.priority,
        due_date: nextDueDate,
        is_recurring: true,
        recurrence_pattern: parentTask.recurrence_pattern,
        recurrence_interval: parentTask.recurrence_interval,
        recurrence_end_date: parentTask.recurrence_end_date,
        parent_task_id: parentTask.id
      };

      return await this.create(nextTask);
    } catch (error) {
      console.error('Error in createNextRecurrence:', error);
      throw error;
    }
  }

  static calculateNextDueDate(currentDueDate, pattern, interval) {
    const date = new Date(currentDueDate);
    
    switch (pattern.toLowerCase()) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * interval));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + interval);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
      default:
        throw new Error('Invalid recurrence pattern');
    }

    return date;
  }

  static async getRecurringTasks() {
    try {
      const query = `
        SELECT t.*, 
          COALESCE(json_agg(json_build_object(
            'id', tag.id,
            'name', tag.name,
            'color', tag.color
          )) FILTER (WHERE tag.id IS NOT NULL), '[]') as tags
        FROM tasks t
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        LEFT JOIN tags tag ON tt.tag_id = tag.id
        WHERE t.is_recurring = true
        GROUP BY t.id
        ORDER BY t.due_date ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getRecurringTasks:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.query('BEGIN');

      // Delete task tags
      await db.query('DELETE FROM task_tags WHERE task_id = $1', [id]);

      // Delete the task
      const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

      await db.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error in Task.delete:', error);
      throw error;
    }
  }

  static async reorder(positions) {
    try {
      await db.query('BEGIN');

      for (const { id, position } of positions) {
        await db.query(
          'UPDATE tasks SET position = $1 WHERE id = $2',
          [position, id]
        );
      }

      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error in Task.reorder:', error);
      throw error;
    }
  }
}

module.exports = Task; 