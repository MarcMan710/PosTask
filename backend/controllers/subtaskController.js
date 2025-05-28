const Subtask = require('../models/Subtask');

const subtaskController = {
  async createSubtask(req, res) {
    try {
      const { task_id, title, description, status } = req.body;
      
      if (!task_id || !title) {
        return res.status(400).json({ error: 'Task ID and title are required' });
      }

      const subtask = await Subtask.create({
        task_id,
        title,
        description,
        status
      });

      res.status(201).json(subtask);
    } catch (error) {
      console.error('Error creating subtask:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getSubtasksByTaskId(req, res) {
    try {
      const { task_id } = req.params;
      const subtasks = await Subtask.findByTaskId(task_id);
      res.json(subtasks);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateSubtask(req, res) {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body;

      const subtask = await Subtask.findById(id);
      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      const updatedSubtask = await Subtask.update(id, {
        title: title || subtask.title,
        description: description || subtask.description,
        status: status || subtask.status
      });

      res.json(updatedSubtask);
    } catch (error) {
      console.error('Error updating subtask:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteSubtask(req, res) {
    try {
      const { id } = req.params;
      const subtask = await Subtask.findById(id);
      
      if (!subtask) {
        return res.status(404).json({ error: 'Subtask not found' });
      }

      await Subtask.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting subtask:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async reorderSubtasks(req, res) {
    try {
      const { task_id } = req.params;
      const { startPosition, endPosition } = req.body;
      
      if (typeof startPosition !== 'number' || typeof endPosition !== 'number') {
        return res.status(400).json({ error: 'Start and end positions must be numbers' });
      }

      const updatedSubtasks = await Subtask.reorder(task_id, startPosition, endPosition);
      res.json(updatedSubtasks);
    } catch (error) {
      console.error('Error reordering subtasks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = subtaskController; 