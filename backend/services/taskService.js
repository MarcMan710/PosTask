const Task = require('../models/Task');
const { ValidationError, NotFoundError } = require('../utils/errors');

class TaskService {
  async createTask(taskData) {
    if (!taskData.title) {
      throw new ValidationError('Title is required');
    }

    return await Task.create({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'pending',
      due_date: taskData.due_date,
      priority: taskData.priority || 'medium',
      tags: taskData.tags,
      is_recurring: taskData.is_recurring || false,
      recurrence_pattern: taskData.recurrence_pattern,
      recurrence_interval: taskData.recurrence_interval,
      recurrence_end_date: taskData.recurrence_end_date
    });
  }

  async getAllTasks(filters) {
    const queryFilters = {
      keyword: filters.keyword,
      status: filters.status,
      priority: filters.priority,
      tags: filters.tags ? filters.tags.split(',').map(Number) : [],
      is_recurring: filters.is_recurring === 'true'
    };

    return await Task.findAll(queryFilters);
  }

  async getTaskById(id) {
    const task = await Task.findById(id);
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async updateTask(id, taskData) {
    if (!taskData.title) {
      throw new ValidationError('Title is required');
    }

    const task = await Task.update(id, {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      due_date: taskData.due_date,
      priority: taskData.priority,
      tags: taskData.tags,
      is_recurring: taskData.is_recurring,
      recurrence_pattern: taskData.recurrence_pattern,
      recurrence_interval: taskData.recurrence_interval,
      recurrence_end_date: taskData.recurrence_end_date
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async deleteTask(id) {
    const success = await Task.delete(id);
    if (!success) {
      throw new NotFoundError('Task not found');
    }
    return true;
  }

  async reorderTasks(positions) {
    if (!Array.isArray(positions)) {
      throw new ValidationError('Positions must be an array');
    }
    await Task.reorder(positions);
    return true;
  }
}

module.exports = new TaskService(); 