const db = require('../config/database');

class Notification {
  static async create({ task_id, user_id, type, message, scheduled_for }) {
    try {
      const query = `
        INSERT INTO notifications (task_id, user_id, type, message, scheduled_for)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(query, [task_id, user_id, type, message, scheduled_for]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Notification.create:', error);
      throw error;
    }
  }

  static async findByUserId(user_id) {
    try {
      const query = `
        SELECT n.*, t.title as task_title
        FROM notifications n
        LEFT JOIN tasks t ON n.task_id = t.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
      `;
      const result = await db.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      console.error('Error in Notification.findByUserId:', error);
      throw error;
    }
  }

  static async markAsRead(id) {
    try {
      const query = `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Notification.markAsRead:', error);
      throw error;
    }
  }

  static async getPendingNotifications() {
    try {
      const query = `
        SELECT n.*, t.title as task_title, u.email as user_email
        FROM notifications n
        JOIN tasks t ON n.task_id = t.id
        JOIN users u ON n.user_id = u.id
        WHERE n.scheduled_for <= CURRENT_TIMESTAMP
        AND n.is_read = false
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in Notification.getPendingNotifications:', error);
      throw error;
    }
  }
}

module.exports = Notification; 