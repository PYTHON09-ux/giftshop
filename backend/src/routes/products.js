const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Escape regex special characters so user input is treated as a literal
// substring to search for, not interpreted as a regex pattern.
const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET all products with filters
router.get('/', async (req, res) => {
  try {
    const {
      search, category, subCategory, minPrice, maxPrice,
      isFeatured, isNewArrival, isBestseller, tags, occasion, giftFor,
      sort = '-createdAt', page = 1, limit = 20, isActive,
    } = req.query;

    const query = {};

    // isActive: query param arrives as a STRING ('true' | 'false' | 'all') or is absent.
    // Default behaviour (param absent) = only active products, which is what the
    // public shop page needs. Admin screens explicitly pass isActive=all.
    if (isActive === 'all') {
      // no filter applied — show everything
    } else if (isActive === 'false') {
      query.isActive = false;
    } else {
      query.isActive = true;
    }

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isBestseller === 'true') query.isBestseller = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (tags) query.tags = { $in: tags.split(',') };
    if (occasion) query.occasion = { $in: occasion.split(',') };
    if (giftFor) query.giftFor = { $in: giftFor.split(',') };

    // Partial, case-insensitive search across name/description/tags/category.
    // Using a regex instead of MongoDB's $text operator because $text does
    // whole-word stemmed matching only — typing "mu" would never match
    // "Mug". A regex lets people find products from any partial substring.
    if (search) {
      const pattern = escapeRegex(search.trim());
      if (pattern) {
        const rx = new RegExp(pattern, 'i');
        query.$or = [
          { name: rx },
          { description: rx },
          { tags: rx },
          { category: rx },
          { subCategory: rx },
        ];
      }
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.views = (product.views || 0) + 1;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create product (admin)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update product (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE product (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add review
router.post('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.reviews.push(req.body);
    product.numReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST like product
router.post('/:id/like', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, likes: product.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST share product
router.post('/:id/share', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, shares: product.shares });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update stock (admin)
router.patch('/:id/stock', protect, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET stats (admin)
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const [total, active, lowStock, outOfStock, featured] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ isFeatured: true }),
    ]);
    const topViewed = await Product.find({ isActive: true }).sort('-views').limit(5).select('name views images price');
    const topLiked = await Product.find({ isActive: true }).sort('-likes').limit(5).select('name likes images price');
    res.json({ success: true, stats: { total, active, lowStock, outOfStock, featured }, topViewed, topLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
