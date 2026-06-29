require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:4xYRYyqCL8laaRQd@cluster0.1lrgq1c.mongodb.net/';

const categories = [
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
    ],
  },
  {
    name: 'Self-care & wellness', slug: 'self-care-wellness', color: '#4F6B6A',
    description: 'For slowing down and resetting',
    subCategories: [
      { name: 'Bath & body', slug: 'bath-body' },
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
];

const sampleProducts = [
  {
    name: 'Personalised photo mug',
    description: 'Start every morning with a favourite memory. Upload any photo for premium ceramic printing. Microwave and dishwasher safe.',
    price: 399, comparePrice: 599, category: 'personalised-gifts', subCategory: 'photo-gifts',
    stock: 50, isActive: true, isFeatured: true, isNewArrival: true, customizable: true,
    customizationOptions: ['Photo', 'Name', 'Message'],
    tags: ['mug', 'photo', 'birthday'],
    occasion: ['Birthday', 'Anniversary', 'Graduation'],
    giftFor: ['Her', 'Him', 'Parents'],
    images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop', alt: 'Photo mug' }],
  },
  {
    name: 'Hand-poured soy candle set',
    description: 'Three hand-poured soy wax candles in lavender, sandalwood, and vanilla. Each burns up to 40 hours.',
    price: 799, comparePrice: 1099, category: 'home-lifestyle', subCategory: 'candles-diffusers',
    stock: 30, isActive: true, isFeatured: true, isBestseller: true,
    tags: ['candle', 'self-care', 'home'],
    occasion: ['Birthday', 'Housewarming'],
    giftFor: ['Her', 'Friends'],
    images: [{ url: 'https://images.unsplash.com/photo-1602874801007-bd36c5af9e5b?w=800&h=800&fit=crop', alt: 'Candle set' }],
  },
  {
    name: 'Custom name necklace',
    description: 'An 18k gold-plated necklace with a name or word of your choosing. Available in gold, silver, and rose gold finishes.',
    price: 1299, comparePrice: 1799, category: 'personalised-gifts', subCategory: 'name-jewelry',
    stock: 25, isActive: true, isFeatured: true, isNewArrival: true, customizable: true,
    customizationOptions: ['Name', 'Font', 'Metal colour'],
    tags: ['jewellery', 'necklace', 'personalised'],
    occasion: ['Birthday', 'Anniversary'],
    giftFor: ['Her'],
    images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop', alt: 'Name necklace' }],
  },
  {
    name: 'Illustrated hardcover journal',
    description: 'A hardcover journal with 200 pages of premium cream paper and lay-flat binding.',
    price: 499, category: 'stationery-paper', subCategory: 'journals-notebooks',
    stock: 45, isActive: true, isBestseller: true,
    tags: ['journal', 'stationery', 'writing'],
    occasion: ['Birthday', 'Graduation'],
    giftFor: ['Her', 'Friends', 'Teacher'],
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop', alt: 'Journal' }],
  },
  {
    name: 'Artisan gift hamper',
    description: 'A curated selection of premium chocolates, artisan biscuits, and gourmet tea with a handwritten note card.',
    price: 1999, comparePrice: 2499, category: 'food-treats', subCategory: 'gift-hampers',
    stock: 15, isActive: true, isFeatured: true, isBestseller: true,
    tags: ['hamper', 'chocolate', 'gift-set'],
    occasion: ['Birthday', 'Housewarming'],
    giftFor: ['Her', 'Him', 'Parents', 'Boss'],
    images: [{ url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&h=800&fit=crop', alt: 'Gift hamper' }],
  },
  {
    name: 'Canvas tote bag',
    description: 'Heavy-duty natural canvas tote with a printed design. Holds up to 15kg.',
    price: 349, category: 'fashion-accessories', subCategory: 'tote-bags',
    stock: 3, isActive: true, isNewArrival: true,
    tags: ['tote', 'eco', 'bag'],
    occasion: ['Birthday', 'Graduation'],
    giftFor: ['Her', 'Friends'],
    images: [{ url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop', alt: 'Tote bag' }],
  },
  {
    name: 'Bath ritual gift set',
    description: 'Six handmade bath bombs in rose, jasmine, lavender, cherry blossom, peony, and lily.',
    price: 649, comparePrice: 849, category: 'self-care-wellness', subCategory: 'bath-body',
    stock: 0, isActive: true,
    tags: ['bath', 'spa', 'self-care'],
    occasion: ['Birthday'],
    giftFor: ['Her', 'Friends'],
    images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4d8a432?w=800&h=800&fit=crop', alt: 'Bath set' }],
  },
  {
    name: 'Mini succulent trio',
    description: 'Three mini succulents in hand-painted ceramic pots. Low maintenance, high charm.',
    price: 599, category: 'home-lifestyle', subCategory: 'plants-pots',
    stock: 20, isActive: true, isNewArrival: true,
    tags: ['plant', 'succulent', 'desk'],
    occasion: ['Housewarming'],
    giftFor: ['Her', 'Friends', 'Teacher'],
    images: [{ url: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800&h=800&fit=crop', alt: 'Succulents' }],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI); // ← this was missing
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ email: 'admin@giftshopie.com' });
  if (!existing) {
    await Admin.create({ username: 'admin', email: 'admin@giftshopie.com', password: 'Admin@123', role: 'superadmin' });
    console.log('Admin created: admin@giftshopie.com / Admin@123');
  } else {
    console.log('Admin already exists');
  }

  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log(`Seeded ${categories.length} categories`);

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} sample products`);

  console.log('\nDone. Frontend: http://localhost:5173');
  console.log('Admin login: http://localhost:5173/admin/login');
  console.log('  admin@giftshopie.com / Admin@123\n');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
