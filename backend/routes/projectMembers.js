const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middlewares/auth');

// Get all members of a project
router.get('/:projectId/members', auth, async (req, res) => {
  try {
    const members = await Project.getMembers(req.params.projectId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a member to a project
router.post('/:projectId/members', auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const member = await Project.addMember(req.params.projectId, req.user.id, userId, role);
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a member from a project
router.delete('/:projectId/members/:memberId', auth, async (req, res) => {
  try {
    const result = await Project.removeMember(req.params.projectId, req.user.id, req.params.memberId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 