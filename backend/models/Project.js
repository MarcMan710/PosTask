const pool = require('../db/config');

class Project {
  static async create({ name, description, color, owner_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create project
      const projectQuery = `
        INSERT INTO projects (name, description, color, owner_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const projectValues = [name, description, color, owner_id];
      const { rows: [project] } = await client.query(projectQuery, projectValues);

      // Add owner as project member
      const memberQuery = `
        INSERT INTO project_members (project_id, user_id, role)
        VALUES ($1, $2, 'owner')
      `;
      await client.query(memberQuery, [project.id, owner_id]);

      await client.query('COMMIT');
      return project;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findAll(userId) {
    const query = `
      SELECT DISTINCT p.*, pm.role as user_role
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = $1 OR pm.user_id = $1
      ORDER BY p.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async findById(id, userId) {
    const query = `
      SELECT p.*, pm.role as user_role
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2
      WHERE p.id = $1
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  }

  static async update(id, { name, description, color }, userId) {
    const project = await this.findById(id, userId);
    if (!project || project.user_role !== 'owner') {
      throw new Error('Unauthorized to update project');
    }

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

  static async delete(id, userId) {
    const project = await this.findById(id, userId);
    if (!project || project.user_role !== 'owner') {
      throw new Error('Unauthorized to delete project');
    }

    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async getTasks(id, userId) {
    const project = await this.findById(id, userId);
    if (!project) {
      throw new Error('Project not found or unauthorized');
    }

    const query = `
      SELECT t.*, p.name as project_name, p.color as project_color,
             u.username as assigned_to_username
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
    `;
    const { rows } = await pool.query(query, [id]);
    return rows;
  }

  static async addMember(projectId, userId, newMemberId, role = 'member') {
    const project = await this.findById(projectId, userId);
    if (!project || project.user_role !== 'owner') {
      throw new Error('Unauthorized to add members');
    }

    const query = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [projectId, newMemberId, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async removeMember(projectId, userId, memberId) {
    const project = await this.findById(projectId, userId);
    if (!project || project.user_role !== 'owner') {
      throw new Error('Unauthorized to remove members');
    }

    const query = `
      DELETE FROM project_members
      WHERE project_id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [projectId, memberId]);
    return rows[0];
  }

  static async getMembers(projectId) {
    const query = `
      SELECT u.id, u.username, u.email, pm.role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.role DESC, u.username ASC
    `;
    const { rows } = await pool.query(query, [projectId]);
    return rows;
  }
}

module.exports = Project; 