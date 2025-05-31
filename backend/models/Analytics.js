const pool = require('../db/config');

class Analytics {
  // Task Analytics Methods
  static async updateTaskAnalytics(taskId, userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO task_analytics (
          task_id, user_id, time_spent, completion_time,
          status_changes, comment_count, attachment_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (task_id) DO UPDATE
        SET
          time_spent = task_analytics.time_spent + $3,
          completion_time = COALESCE($4, task_analytics.completion_time),
          status_changes = task_analytics.status_changes + $5,
          comment_count = task_analytics.comment_count + $6,
          attachment_count = task_analytics.attachment_count + $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const values = [
        taskId,
        userId,
        data.timeSpent || 0,
        data.completionTime,
        data.statusChanges || 0,
        data.commentCount || 0,
        data.attachmentCount || 0
      ];

      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User Analytics Methods
  static async updateUserAnalytics(userId, date, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO user_analytics (
          user_id, date, tasks_completed, tasks_created,
          total_time_spent, average_completion_time, productivity_score
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, date) DO UPDATE
        SET
          tasks_completed = user_analytics.tasks_completed + $3,
          tasks_created = user_analytics.tasks_created + $4,
          total_time_spent = user_analytics.total_time_spent + $5,
          average_completion_time = ($6 + user_analytics.average_completion_time) / 2,
          productivity_score = $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const values = [
        userId,
        date,
        data.tasksCompleted || 0,
        data.tasksCreated || 0,
        data.totalTimeSpent || 0,
        data.averageCompletionTime || 0,
        data.productivityScore || 0
      ];

      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserAnalytics(userId, startDate, endDate) {
    const query = `
      SELECT *
      FROM user_analytics
      WHERE user_id = $1
        AND date BETWEEN $2 AND $3
      ORDER BY date ASC
    `;
    const { rows } = await pool.query(query, [userId, startDate, endDate]);
    return rows;
  }

  // Project Analytics Methods
  static async updateProjectAnalytics(projectId, date, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO project_analytics (
          project_id, date, total_tasks, completed_tasks,
          active_tasks, total_members, average_completion_time
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (project_id, date) DO UPDATE
        SET
          total_tasks = $3,
          completed_tasks = $4,
          active_tasks = $5,
          total_members = $6,
          average_completion_time = $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const values = [
        projectId,
        date,
        data.totalTasks || 0,
        data.completedTasks || 0,
        data.activeTasks || 0,
        data.totalMembers || 0,
        data.averageCompletionTime || 0
      ];

      const { rows } = await client.query(query, values);
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getProjectAnalytics(projectId, startDate, endDate) {
    const query = `
      SELECT *
      FROM project_analytics
      WHERE project_id = $1
        AND date BETWEEN $2 AND $3
      ORDER BY date ASC
    `;
    const { rows } = await pool.query(query, [projectId, startDate, endDate]);
    return rows;
  }

  // Dashboard Methods
  static async getDashboardStats(userId) {
    const query = `
      WITH user_stats AS (
        SELECT
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          SUM(time_spent) as total_time_spent
        FROM tasks
        WHERE assigned_to = $1
      ),
      project_stats AS (
        SELECT
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = $1
      ),
      recent_activity AS (
        SELECT
          COUNT(*) as total_activities
        FROM activity_logs
        WHERE user_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      SELECT
        us.*,
        ps.*,
        ra.total_activities
      FROM user_stats us
      CROSS JOIN project_stats ps
      CROSS JOIN recent_activity ra
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async getProductivityTrends(userId, days = 30) {
    const query = `
      SELECT
        date,
        tasks_completed,
        total_time_spent,
        productivity_score
      FROM user_analytics
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date ASC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}

module.exports = Analytics; 