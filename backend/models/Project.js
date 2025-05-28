const pool = require('../db/config');

class Project {
  static async create({ name, description, color }) {
    const query = `
      INSERT INTO projects (name, description, color)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [name, description, color];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async update(id, { name, description, color }) {
    const query = `
      UPDATE projects
      SET name = $1, description = $2, color = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, description, color, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async getTasks(id) {
    const query = `
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `;
    const { rows } = await pool.query(query, [id]);
    return rows;
  }
}

module.exports = Project; 