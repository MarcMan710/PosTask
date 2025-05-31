const pool = require('../db/config');

class ActivityLog {
  static async create({ userId, entityType, entityId, action, oldValues = null, newValues = null }) {
    const query = `
      INSERT INTO activity_logs (user_id, entity_type, entity_id, action, old_values, new_values)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [userId, entityType, entityId, action, oldValues, newValues];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEntity(entityType, entityId) {
    const query = `
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = $1 AND al.entity_id = $2
      ORDER BY al.created_at DESC
    `;
    const { rows } = await pool.query(query, [entityType, entityId]);
    return rows;
  }

  static async findByUser(userId, limit = 50) {
    const query = `
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.user_id = $1
      ORDER BY al.created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [userId, limit]);
    return rows;
  }

  static async findByProject(projectId, limit = 50) {
    const query = `
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE (al.entity_type = 'project' AND al.entity_id = $1)
         OR (al.entity_type = 'task' AND al.entity_id IN (
           SELECT id FROM tasks WHERE project_id = $1
         ))
         OR (al.entity_type = 'comment' AND al.entity_id IN (
           SELECT c.id FROM comments c
           JOIN tasks t ON c.task_id = t.id
           WHERE t.project_id = $1
         ))
      ORDER BY al.created_at DESC
      LIMIT $2
    `;
    const { rows } = await pool.query(query, [projectId, limit]);
    return rows;
  }

  static async getRecentActivity(limit = 50) {
    const query = `
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows;
  }

  static async getActivitySummary(entityType, entityId) {
    const query = `
      SELECT 
        action,
        COUNT(*) as count,
        MIN(created_at) as first_occurrence,
        MAX(created_at) as last_occurrence
      FROM activity_logs
      WHERE entity_type = $1 AND entity_id = $2
      GROUP BY action
      ORDER BY last_occurrence DESC
    `;
    const { rows } = await pool.query(query, [entityType, entityId]);
    return rows;
  }

  static async getActivityTimeline(startDate, endDate, entityType = null) {
    let query = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        entity_type,
        action,
        COUNT(*) as count
      FROM activity_logs
      WHERE created_at BETWEEN $1 AND $2
    `;
    const values = [startDate, endDate];

    if (entityType) {
      query += ' AND entity_type = $3';
      values.push(entityType);
    }

    query += `
      GROUP BY DATE_TRUNC('day', created_at), entity_type, action
      ORDER BY date DESC, entity_type, action
    `;

    const { rows } = await pool.query(query, values);
    return rows;
  }
}

module.exports = ActivityLog; 