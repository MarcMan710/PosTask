const pool = require('../db/config');

class Comment {
  static async create({ taskId, userId, content, parentCommentId = null, mentions = [] }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the comment
      const commentQuery = `
        INSERT INTO comments (task_id, user_id, parent_comment_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const { rows: [comment] } = await client.query(commentQuery, [
        taskId,
        userId,
        parentCommentId,
        content
      ]);

      // Add mentions if any
      if (mentions.length > 0) {
        const mentionValues = mentions.map(mentionId => `(${comment.id}, ${mentionId})`).join(',');
        await client.query(`
          INSERT INTO mentions (comment_id, user_id)
          VALUES ${mentionValues}
        `);
      }

      await client.query('COMMIT');
      return this.findById(comment.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             u.username as author_username,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', m.user_id,
                   'username', mu.username
                 )
               ) FILTER (WHERE m.id IS NOT NULL),
               '[]'
             ) as mentions
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN mentions m ON c.id = m.comment_id
      LEFT JOIN users mu ON m.user_id = mu.id
      WHERE c.id = $1
      GROUP BY c.id, u.username
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByTaskId(taskId) {
    const query = `
      WITH RECURSIVE comment_tree AS (
        -- Base case: get all root comments
        SELECT c.*, u.username as author_username,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', m.user_id,
                     'username', mu.username
                   )
                 ) FILTER (WHERE m.id IS NOT NULL),
                 '[]'
               ) as mentions,
               0 as level
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN mentions m ON c.id = m.comment_id
        LEFT JOIN users mu ON m.user_id = mu.id
        WHERE c.task_id = $1 AND c.parent_comment_id IS NULL
        GROUP BY c.id, u.username

        UNION ALL

        -- Recursive case: get all replies
        SELECT c.*, u.username as author_username,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', m.user_id,
                     'username', mu.username
                   )
                 ) FILTER (WHERE m.id IS NOT NULL),
                 '[]'
               ) as mentions,
               ct.level + 1
        FROM comments c
        JOIN comment_tree ct ON c.parent_comment_id = ct.id
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN mentions m ON c.id = m.comment_id
        LEFT JOIN users mu ON m.user_id = mu.id
        GROUP BY c.id, u.username, ct.level
      )
      SELECT * FROM comment_tree
      ORDER BY level, created_at
    `;
    const { rows } = await pool.query(query, [taskId]);
    return rows;
  }

  static async update(id, { content, mentions = [] }, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update the comment
      const commentQuery = `
        UPDATE comments
        SET content = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      const { rows: [comment] } = await client.query(commentQuery, [content, id, userId]);

      if (!comment) {
        throw new Error('Comment not found or unauthorized');
      }

      // Update mentions
      await client.query('DELETE FROM mentions WHERE comment_id = $1', [id]);
      
      if (mentions.length > 0) {
        const mentionValues = mentions.map(mentionId => `(${id}, ${mentionId})`).join(',');
        await client.query(`
          INSERT INTO mentions (comment_id, user_id)
          VALUES ${mentionValues}
        `);
      }

      await client.query('COMMIT');
      return this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM comments
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  }

  static async getMentionsForUser(userId) {
    const query = `
      SELECT c.*, t.title as task_title, u.username as author_username
      FROM mentions m
      JOIN comments c ON m.comment_id = c.id
      JOIN tasks t ON c.task_id = t.id
      JOIN users u ON c.user_id = u.id
      WHERE m.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}

module.exports = Comment; 