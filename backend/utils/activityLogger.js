const ActivityLog = require('../models/ActivityLog');

class ActivityLogger {
  static async logActivity({ userId, entityType, entityId, action, oldValues = null, newValues = null }) {
    try {
      // Filter out sensitive information
      const sanitizedOldValues = this.sanitizeValues(oldValues);
      const sanitizedNewValues = this.sanitizeValues(newValues);

      // Create the activity log
      await ActivityLog.create({
        userId,
        entityType,
        entityId,
        action,
        oldValues: sanitizedOldValues,
        newValues: sanitizedNewValues
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw the error to prevent disrupting the main operation
    }
  }

  static sanitizeValues(values) {
    if (!values) return null;

    // Create a copy of the values
    const sanitized = { ...values };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  static getChangeDescription(oldValues, newValues) {
    if (!oldValues || !newValues) return '';

    const changes = [];
    for (const [key, newValue] of Object.entries(newValues)) {
      if (oldValues[key] !== newValue) {
        changes.push(`${key}: ${oldValues[key]} → ${newValue}`);
      }
    }

    return changes.join(', ');
  }

  static async logTaskActivity(taskId, userId, action, oldValues = null, newValues = null) {
    await this.logActivity({
      userId,
      entityType: 'task',
      entityId: taskId,
      action,
      oldValues,
      newValues
    });
  }

  static async logProjectActivity(projectId, userId, action, oldValues = null, newValues = null) {
    await this.logActivity({
      userId,
      entityType: 'project',
      entityId: projectId,
      action,
      oldValues,
      newValues
    });
  }

  static async logCommentActivity(commentId, userId, action, oldValues = null, newValues = null) {
    await this.logActivity({
      userId,
      entityType: 'comment',
      entityId: commentId,
      action,
      oldValues,
      newValues
    });
  }

  static async logUserActivity(userId, action, oldValues = null, newValues = null) {
    await this.logActivity({
      userId,
      entityType: 'user',
      entityId: userId,
      action,
      oldValues,
      newValues
    });
  }
}

module.exports = ActivityLogger; 