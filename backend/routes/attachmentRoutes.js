const express = require('express');
const router = express.Router();
const multer = require('multer');
const Attachment = require('../models/Attachment');
const auth = require('../middlewares/auth');
const ActivityLogger = require('../utils/activityLogger');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all attachments for a task
router.get('/tasks/:taskId/attachments', auth, async (req, res) => {
  try {
    const attachments = await Attachment.findByTaskId(req.params.taskId);
    res.json(attachments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload a file attachment
router.post('/tasks/:taskId/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    await Attachment.validateFile(req.file);
    const attachment = await Attachment.create({
      taskId: req.params.taskId,
      userId: req.user.id,
      file: req.file
    });

    // Log the activity
    await ActivityLogger.logTaskActivity(
      req.params.taskId,
      req.user.id,
      'add_attachment',
      null,
      { attachment_id: attachment.id, file_name: attachment.file_name }
    );

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a link attachment
router.post('/tasks/:taskId/links', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    await Attachment.validateLink(url);
    const attachment = await Attachment.create({
      taskId: req.params.taskId,
      userId: req.user.id,
      isLink: true,
      linkUrl: url
    });

    // Log the activity
    await ActivityLogger.logTaskActivity(
      req.params.taskId,
      req.user.id,
      'add_link',
      null,
      { attachment_id: attachment.id, link_url: url }
    );

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download a file attachment
router.get('/attachments/:id/download', auth, async (req, res) => {
  try {
    const { stream, attachment } = await Attachment.getFileStream(req.params.id);
    
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
    
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an attachment
router.delete('/attachments/:id', auth, async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const deletedAttachment = await Attachment.delete(req.params.id, req.user.id);

    // Log the activity
    await ActivityLogger.logTaskActivity(
      attachment.task_id,
      req.user.id,
      'remove_attachment',
      { attachment_id: attachment.id, file_name: attachment.file_name },
      null
    );

    res.json(deletedAttachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 