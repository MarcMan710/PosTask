const Tag = require('../models/Tag');

const tagController = {
  // Create a new tag
  async createTag(req, res) {
    try {
      const { name, color } = req.body;
      const created_by = req.user.id; // Assuming you have user authentication middleware

      const tag = await Tag.create({ name, color, created_by });
      res.status(201).json(tag);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        res.status(400).json({ error: 'Tag with this name already exists' });
      } else {
        res.status(500).json({ error: 'Error creating tag' });
      }
    }
  },

  // Get all tags
  async getAllTags(req, res) {
    try {
      const tags = await Tag.findAll();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching tags' });
    }
  },

  // Get tag by ID
  async getTagById(req, res) {
    try {
      const tag = await Tag.findById(req.params.id);
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching tag' });
    }
  },

  // Update tag
  async updateTag(req, res) {
    try {
      const { name, color } = req.body;
      const tag = await Tag.update(req.params.id, { name, color });
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      res.json(tag);
    } catch (error) {
      if (error.code === '23505') {
        res.status(400).json({ error: 'Tag with this name already exists' });
      } else {
        res.status(500).json({ error: 'Error updating tag' });
      }
    }
  },

  // Delete tag
  async deleteTag(req, res) {
    try {
      const tag = await Tag.delete(req.params.id);
      if (!tag) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting tag' });
    }
  },

  // Add tag to task
  async addTagToTask(req, res) {
    try {
      const { taskId, tagId } = req.params;
      const result = await Tag.addTagToTask(taskId, tagId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error adding tag to task' });
    }
  },

  // Remove tag from task
  async removeTagFromTask(req, res) {
    try {
      const { taskId, tagId } = req.params;
      const result = await Tag.removeTagFromTask(taskId, tagId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error removing tag from task' });
    }
  },

  // Get tags for a task
  async getTaskTags(req, res) {
    try {
      const tags = await Tag.getTaskTags(req.params.taskId);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching task tags' });
    }
  }
};

module.exports = tagController; 