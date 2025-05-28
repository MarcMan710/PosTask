const express = require('express');
const router = express.Router();
const subtaskController = require('../controllers/subtaskController');

// Create a new subtask
router.post('/', subtaskController.createSubtask);

// Get subtasks for a task
router.get('/task/:task_id', subtaskController.getSubtasksByTaskId);

// Update a subtask
router.put('/:id', subtaskController.updateSubtask);

// Delete a subtask
router.delete('/:id', subtaskController.deleteSubtask);

// Reorder subtasks
router.post('/task/:task_id/reorder', subtaskController.reorderSubtasks);

module.exports = router; 