const express = require('express');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { isPublic: true };
    if (status) query.status = status;
    if (type) query.type = type;
    const events = await Event.find(query).populate('scheduledProducts', 'name price images').sort('-startDate');
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/admin/all', protect, async (req, res) => {
  try {
    const events = await Event.find().populate('scheduledProducts', 'name price images').sort('-createdAt');
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('scheduledProducts');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.admin.username });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/admin/sync-status', protect, async (req, res) => {
  try {
    const now = new Date();
    await Event.updateMany({ startDate: { $lte: now }, status: 'scheduled' }, { status: 'active' });
    await Event.updateMany({ endDate: { $lt: now }, status: 'active' }, { status: 'ended' });
    res.json({ success: true, message: 'Statuses synced' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
