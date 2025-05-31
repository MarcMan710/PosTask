const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validate = require('../middlewares/validation');
const taskValidation = require('../validations/taskValidation');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Create a new task
router.post('/', 
  validate(taskValidation.createTask),
  taskController.createTask
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tag IDs
 *       - in: query
 *         name: is_recurring
 *         schema:
 *           type: boolean
 *         description: Filter by recurring tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 */
// Get all tasks
router.get('/',
  validate(taskValidation.getAllTasks),
  taskController.getAllTasks
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
// Get a specific task by ID
router.get('/:id',
  validate(taskValidation.getTaskById),
  taskController.getTaskById
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
// Update a task
router.put('/:id',
  validate(taskValidation.updateTask),
  taskController.updateTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
// Delete a task
router.delete('/:id',
  validate(taskValidation.deleteTask),
  taskController.deleteTask
);

/**
 * @swagger
 * /api/v1/tasks/reorder:
 *   post:
 *     summary: Reorder tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Tasks reordered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// Reorder tasks
router.post('/reorder',
  validate(taskValidation.reorderTasks),
  taskController.reorderTasks
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         due_date:
 *           type: string
 *           format: date
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *         is_recurring:
 *           type: boolean
 *         recurrence_pattern:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *         recurrence_interval:
 *           type: integer
 *         recurrence_end_date:
 *           type: string
 *           format: date
 *     TaskInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         due_date:
 *           type: string
 *           format: date
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *         tags:
 *           type: array
 *           items:
 *             type: integer
 *         is_recurring:
 *           type: boolean
 *         recurrence_pattern:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *         recurrence_interval:
 *           type: integer
 *         recurrence_end_date:
 *           type: string
 *           format: date
 */

module.exports = router; 