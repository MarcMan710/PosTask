const Task = require('../models/Task');

const taskController = {
  async createTask(req, res) {
    try {
      const { 
        title, 
        description, 
        status, 
        due_date, 
        priority, 
        tags,
        is_recurring,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date
      } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const task = await Task.create({
        title,
        description,
        status: status || 'pending',
        due_date,
        priority: priority || 'medium',
        tags,
        is_recurring: is_recurring || false,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getAllTasks(req, res) {
    try {
      const filters = {
        keyword: req.query.keyword,
        status: req.query.status,
        priority: req.query.priority,
        tags: req.query.tags ? req.query.tags.split(',').map(Number) : [],
        is_recurring: req.query.is_recurring === 'true'
      };

      const tasks = await Task.findAll(filters);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  },

  async getTaskById(req, res) {
    try {
      const task = await Task.findById(req.params.id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: 'Error fetching task' });
    }
  },

  async updateTask(req, res) {
    try {
      const { 
        title, 
        description, 
        status, 
        due_date, 
        priority, 
        tags,
        is_recurring,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date
      } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const task = await Task.update(req.params.id, {
        title,
        description,
        status,
        due_date,
        priority,
        tags,
        is_recurring,
        recurrence_pattern,
        recurrence_interval,
        recurrence_end_date
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Error updating task' });
    }
  },

  async deleteTask(req, res) {
    try {
      const success = await Task.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Error deleting task' });
    }
  },

  async reorderTasks(req, res) {
    try {
      const { positions } = req.body;
      
      if (!Array.isArray(positions)) {
        return res.status(400).json({ message: 'Positions must be an array' });
      }

      await Task.reorder(positions);
      res.status(200).json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      console.error('Error reordering tasks:', error);
      res.status(500).json({ message: 'Error reordering tasks' });
    }
  }
};

module.exports = taskController; 