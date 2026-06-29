const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['new_arrival', 'sale', 'restock', 'seasonal', 'launch', 'collaboration', 'custom'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended'],
    default: 'draft',
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  scheduledProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  banner: { url: String, publicId: String },
  discountPercent: { type: Number, min: 0, max: 100, default: 0 },
  badgeText: { type: String, default: 'Coming soon' },
  badgeColor: { type: String, default: '#B5582C' },
  isPublic: { type: Boolean, default: true },
  notifySubscribers: { type: Boolean, default: false },
  createdBy: { type: String, default: 'admin' },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
