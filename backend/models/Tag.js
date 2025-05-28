const db = require('../db/config');

const Tag = {
  async create({ name, color, created_by }) {
    const query = `
      INSERT INTO tags (name, color, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [name, color, created_by];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findAll() {
    const query = 'SELECT * FROM tags ORDER BY name ASC';
    const { rows } = await db.query(query);
    return rows;
  },

  async findById(id) {
    const query = 'SELECT * FROM tags WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  async findByName(name) {
    const query = 'SELECT * FROM tags WHERE name ILIKE $1';
    const { rows } = await db.query(query, [`%${name}%`]);
    return rows;
  },

  async update(id, { name, color }) {
    const query = `
      UPDATE tags
      SET name = $1, color = $2
      WHERE id = $3
      RETURNING *
    `;
    const values = [name, color, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM tags WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  async addTagToTask(taskId, tagId) {
    const query = `
      INSERT INTO task_tags (task_id, tag_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [taskId, tagId];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async removeTagFromTask(taskId, tagId) {
    const query = `
      DELETE FROM task_tags
      WHERE task_id = $1 AND tag_id = $2
      RETURNING *
    `;
    const values = [taskId, tagId];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async getTaskTags(taskId) {
    const query = `
      SELECT t.*
      FROM tags t
      JOIN task_tags tt ON t.id = tt.tag_id
      WHERE tt.task_id = $1
      ORDER BY t.name ASC
    `;
    const { rows } = await db.query(query, [taskId]);
    return rows;
  }
};

module.exports = Tag; 