const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Tag CRUD operations
router.post('/', tagController.createTag);
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

// Task-Tag operations
router.post('/task/:taskId/tag/:tagId', tagController.addTagToTask);
router.delete('/task/:taskId/tag/:tagId', tagController.removeTagFromTask);
router.get('/task/:taskId', tagController.getTaskTags);

module.exports = router; 