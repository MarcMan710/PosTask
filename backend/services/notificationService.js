const nodemailer = require('nodemailer');
const Notification = require('../models/notification');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmailNotification(to, subject, text) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text
      });
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  async createTaskReminder(task, user) {
    try {
      // Create notification 24 hours before due date
      const reminderTime = new Date(task.due_date);
      reminderTime.setHours(reminderTime.getHours() - 24);

      const message = `Reminder: Task "${task.title}" is due in 24 hours.`;

      await Notification.create({
        task_id: task.id,
        user_id: user.id,
        type: 'REMINDER',
        message,
        scheduled_for: reminderTime
      });

      // Send immediate email notification
      await this.sendEmailNotification(
        user.email,
        `Task Reminder: ${task.title}`,
        message
      );

      return true;
    } catch (error) {
      console.error('Error creating task reminder:', error);
      return false;
    }
  }

  async processPendingNotifications() {
    try {
      const pendingNotifications = await Notification.getPendingNotifications();

      for (const notification of pendingNotifications) {
        // Send email notification
        await this.sendEmailNotification(
          notification.user_email,
          `Task Reminder: ${notification.task_title}`,
          notification.message
        );

        // Mark notification as read
        await Notification.markAsRead(notification.id);
      }

      return true;
    } catch (error) {
      console.error('Error processing pending notifications:', error);
      return false;
    }
  }
}

module.exports = new NotificationService(); 