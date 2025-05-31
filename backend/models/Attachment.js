const pool = require('../db/config');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Attachment {
  static async create({ taskId, userId, file, isLink = false, linkUrl = null }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let filePath = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;
      let mimeType = null;

      if (!isLink && file) {
        // Generate unique filename
        const fileExt = path.extname(file.originalname);
        fileName = `${uuidv4()}${fileExt}`;
        filePath = path.join('uploads', fileName);
        fileType = fileExt.substring(1);
        fileSize = file.size;
        mimeType = file.mimetype;

        // Ensure uploads directory exists
        await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true });

        // Move file to uploads directory
        await fs.writeFile(path.join(process.cwd(), filePath), file.buffer);
      } else if (isLink && linkUrl) {
        fileName = linkUrl;
        filePath = linkUrl;
        fileType = 'link';
        fileSize = 0;
        mimeType = 'text/uri-list';
      } else {
        throw new Error('Either file or link URL must be provided');
      }

      const query = `
        INSERT INTO attachments (
          task_id, user_id, file_name, file_path, file_type,
          file_size, mime_type, is_link, link_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        taskId,
        userId,
        fileName,
        filePath,
        fileType,
        fileSize,
        mimeType,
        isLink,
        linkUrl
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

  static async findById(id) {
    const query = `
      SELECT a.*, u.username as uploaded_by
      FROM attachments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByTaskId(taskId) {
    const query = `
      SELECT a.*, u.username as uploaded_by
      FROM attachments a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.task_id = $1
      ORDER BY a.created_at DESC
    `;
    const { rows } = await pool.query(query, [taskId]);
    return rows;
  }

  static async delete(id, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get attachment details
      const attachment = await this.findById(id);
      if (!attachment) {
        throw new Error('Attachment not found');
      }

      // Delete file from storage if it's not a link
      if (!attachment.is_link) {
        const filePath = path.join(process.cwd(), attachment.file_path);
        await fs.unlink(filePath).catch(() => {}); // Ignore error if file doesn't exist
      }

      // Delete from database
      const query = 'DELETE FROM attachments WHERE id = $1 AND user_id = $2 RETURNING *';
      const { rows } = await client.query(query, [id, userId]);

      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getFileStream(id) {
    const attachment = await this.findById(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    if (attachment.is_link) {
      throw new Error('Cannot get file stream for link attachments');
    }

    const filePath = path.join(process.cwd(), attachment.file_path);
    return {
      stream: fs.createReadStream(filePath),
      attachment
    };
  }

  static async validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('File type not allowed');
    }

    return true;
  }

  static async validateLink(url) {
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(url)) {
        throw new Error('Invalid URL format');
      }
      return true;
    } catch (error) {
      throw new Error('Invalid link URL');
    }
  }
}

module.exports = Attachment; 