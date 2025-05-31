const taskService = require('../services/taskService');
const logger = require('../utils/logger');

const taskController = {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.body);
      logger.info(`Task created: ${task.id}`);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  async getAllTasks(req, res, next) {
    try {
      const tasks = await taskService.getAllTasks(req.query);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body);
      logger.info(`Task updated: ${task.id}`);
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id);
      logger.info(`Task deleted: ${req.params.id}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async reorderTasks(req, res, next) {
    try {
      await taskService.reorderTasks(req.body.positions);
      logger.info('Tasks reordered successfully');
      res.status(200).json({ message: 'Tasks reordered successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController; 