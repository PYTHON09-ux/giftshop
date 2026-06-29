const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: null },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  tags: [{ type: String }],
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
  }],
  stock: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  sku: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  customizable: { type: Boolean, default: false },
  customizationOptions: [{ type: String }],
  weight: { type: Number },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  shares: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  occasion: [{ type: String }],
  giftFor: [{ type: String }],
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
