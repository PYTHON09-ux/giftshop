const express = require('express');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const router = express.Router();

const slugify = (s = '') => s
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')   // strip anything that isn't a letter, digit, space, or hyphen
  .replace(/[\s-]+/g, '-')        // collapse whitespace/hyphen runs into one hyphen
  .replace(/^-+|-+$/g, '');       // trim leading/trailing hyphens

// Defense-in-depth: even if a client forgets to send slugs (or sends blank
// ones), fill them in from the name server-side rather than letting the
// Mongoose validator reject the whole request.
const normalizeCategoryPayload = (body) => {
  const payload = { ...body };
  if (!payload.slug && payload.name) payload.slug = slugify(payload.name);
  if (Array.isArray(payload.subCategories)) {
    payload.subCategories = payload.subCategories.map((sub) => ({
      ...sub,
      slug: sub.slug || slugify(sub.name || ''),
    }));
  }
  return payload;
};

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder name');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const category = await Category.create(normalizeCategoryPayload(req.body));
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, normalizeCategoryPayload(req.body), { new: true, runValidators: true });
    res.json({ success: true, category });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/seed', protect, async (req, res) => {
  try {
    const defaultCategories = [
      {
        name: 'Personalised gifts', slug: 'personalised-gifts', color: '#B5582C',
        description: 'One-of-a-kind gifts made just for them',
        subCategories: [
          { name: 'Photo gifts', slug: 'photo-gifts' },
          { name: 'Engraved items', slug: 'engraved-items' },
          { name: 'Custom prints', slug: 'custom-prints' },
          { name: 'Name jewellery', slug: 'name-jewelry' },
        ],
      },
      {
        name: 'Stationery & paper', slug: 'stationery-paper', color: '#5B6E55',
        description: 'Paper goods and writing accessories',
        subCategories: [
          { name: 'Greeting cards', slug: 'greeting-cards' },
          { name: 'Journals & notebooks', slug: 'journals-notebooks' },
          { name: 'Gift wrap', slug: 'gift-wrap' },
          { name: 'Planners', slug: 'planners' },
        ],
      },
      {
        name: 'Home & lifestyle', slug: 'home-lifestyle', color: '#7A5230',
        description: 'Considered pieces for everyday living',
        subCategories: [
          { name: 'Candles & diffusers', slug: 'candles-diffusers' },
          { name: 'Mugs & drinkware', slug: 'mugs-drinkware' },
          { name: 'Cushions & throws', slug: 'cushions-throws' },
          { name: 'Wall art', slug: 'wall-art' },
          { name: 'Plants & pots', slug: 'plants-pots' },
        ],
      },
      {
        name: 'Fashion & accessories', slug: 'fashion-accessories', color: '#8C4B3A',
        description: 'Style pieces they will actually wear',
        subCategories: [
          { name: 'Tote bags', slug: 'tote-bags' },
          { name: 'Keychains', slug: 'keychains' },
          { name: 'Hair accessories', slug: 'hair-accessories' },
          { name: 'Pins & patches', slug: 'pins-patches' },
        ],
      },
      {
        name: 'Self-care & wellness', slug: 'self-care-wellness', color: '#4F6B6A',
        description: 'For slowing down and resetting',
        subCategories: [
          { name: 'Bath & body', slug: 'bath-body' },
          { name: 'Face & skin', slug: 'face-skin' },
          { name: 'Aromatherapy', slug: 'aromatherapy' },
          { name: 'Wellness kits', slug: 'wellness-kits' },
        ],
      },
      {
        name: 'Food & treats', slug: 'food-treats', color: '#9C5B2E',
        description: 'Gifts that disappear fast',
        subCategories: [
          { name: 'Chocolates & sweets', slug: 'chocolates-sweets' },
          { name: 'Gift hampers', slug: 'gift-hampers' },
          { name: 'Tea & coffee', slug: 'tea-coffee' },
        ],
      },
      {
        name: 'Tech & gadgets', slug: 'tech-gadgets', color: '#465A6E',
        description: 'For the practically minded',
        subCategories: [
          { name: 'Phone accessories', slug: 'phone-accessories' },
          { name: 'Desk accessories', slug: 'desk-accessories' },
        ],
      },
      {
        name: 'Toys & games', slug: 'toys-games', color: '#6E4F6E',
        description: 'Play is for all ages',
        subCategories: [
          { name: 'Board games', slug: 'board-games' },
          { name: 'Puzzles', slug: 'puzzles' },
          { name: 'Collectibles', slug: 'collectibles' },
        ],
      },
    ];

    await Category.deleteMany({});
    const categories = await Category.insertMany(defaultCategories);
    res.json({ success: true, message: `Seeded ${categories.length} categories`, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
