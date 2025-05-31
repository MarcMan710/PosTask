const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middlewares/auth');

// Get all comments for a task
router.get('/tasks/:taskId/comments', auth, async (req, res) => {
  try {
    const comments = await Comment.findByTaskId(req.params.taskId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new comment
router.post('/tasks/:taskId/comments', auth, async (req, res) => {
  try {
    const { content, parentCommentId, mentions } = req.body;
    const comment = await Comment.create({
      taskId: req.params.taskId,
      userId: req.user.id,
      content,
      parentCommentId,
      mentions
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a comment
router.put('/comments/:commentId', auth, async (req, res) => {
  try {
    const { content, mentions } = req.body;
    const comment = await Comment.update(req.params.commentId, { content, mentions }, req.user.id);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.delete(req.params.commentId, req.user.id);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all mentions for the current user
router.get('/mentions', auth, async (req, res) => {
  try {
    const mentions = await Comment.getMentionsForUser(req.user.id);
    res.json(mentions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 