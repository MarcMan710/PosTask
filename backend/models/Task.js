const db = require('../config/database');
const notificationService = require('../services/notificationService');
const pool = require('../db/config');

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

  static async findById(id, userId) {
    try {
      const query = `
        SELECT t.*, p.name as project_name, p.color as project_color,
               u1.username as created_by_username,
               u2.username as assigned_to_username
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u1 ON t.created_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        WHERE t.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Task.findById:', error);
      throw error;
    }
  }

  static async create({ title, description, due_date, priority, status, project_id, created_by, assigned_to = null }) {
    const query = `
      INSERT INTO tasks (title, description, due_date, priority, status, project_id, created_by, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [title, description, due_date, priority, status, project_id, created_by, assigned_to];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { title, description, due_date, priority, status, assigned_to }, userId) {
    const task = await this.findById(id, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has permission to update the task
    const projectQuery = `
      SELECT pm.role
      FROM project_members pm
      WHERE pm.project_id = $1 AND pm.user_id = $2
    `;
    const { rows: [projectMember] } = await pool.query(projectQuery, [task.project_id, userId]);
    
    if (!projectMember) {
      throw new Error('Unauthorized to update task');
    }

    const query = `
      UPDATE tasks
      SET title = $1, description = $2, due_date = $3, priority = $4,
          status = $5, assigned_to = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const values = [title, description, due_date, priority, status, assigned_to, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id, userId) {
    const task = await this.findById(id, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Check if user has permission to delete the task
    const projectQuery = `
      SELECT pm.role
      FROM project_members pm
      WHERE pm.project_id = $1 AND pm.user_id = $2
    `;
    const { rows: [projectMember] } = await pool.query(projectQuery, [task.project_id, userId]);
    
    if (!projectMember || projectMember.role !== 'owner') {
      throw new Error('Unauthorized to delete task');
    }

    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async getAssignedTasks(userId) {
    const query = `
      SELECT t.*, p.name as project_name, p.color as project_color,
             u.username as created_by_username
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.assigned_to = $1
      ORDER BY t.due_date ASC, t.priority DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async getCreatedTasks(userId) {
    const query = `
      SELECT t.*, p.name as project_name, p.color as project_color,
             u.username as assigned_to_username
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.created_by = $1
      ORDER BY t.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
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