const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectTasks
} = require('../controllers/projectController');

// All routes require authentication
router.use(auth);

// Project routes
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:id/tasks', getProjectTasks);

module.exports = router; 