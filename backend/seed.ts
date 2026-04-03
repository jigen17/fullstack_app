import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URI = 'mongodb://localhost:27017/freeskincare';

// ── Schemas ───────────────────────────────────────────────────────────────────

const ProductImageSchema = new mongoose.Schema(
  {
    url: String,
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);
const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    images: { type: [ProductImageSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    userName: String,
    email: { type: String, lowercase: true },
    password: String,
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    wishlist: [{ type: Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true, _id: true },
);
const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Product' },
    productName: String,
    productImage: { type: String, default: '' },
    quantity: Number,
    priceAtPurchase: Number,
    subtotal: Number,
  },
  { _id: true },
);
const OrderSchema = new mongoose.Schema(
  {
    user: { type: Types.ObjectId, ref: 'User' },
    items: { type: [OrderItemSchema], default: [] },
    pricing: {
      subtotal: Number,
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: Number,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    statusHistory: { type: Array, default: [] },
    shippingAddress: {
      street: String,
      city: String,
      country: String,
      zip: String,
      state: { type: String, default: '' },
    },
    payment: {
      method: { type: String, enum: ['card', 'paypal', 'cash'] },
      status: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid',
      },
      transactionId: { type: String, default: '' },
    },
    tracking: {
      carrier: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      estimatedDelivery: Date,
    },
    paidAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true, _id: true },
);

const Product = mongoose.model('Product', ProductSchema);
const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] =>
  [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const round2 = (n: number) => parseFloat(n.toFixed(2));

// ── Products ──────────────────────────────────────────────────────────────────
// Images from Unsplash — all skincare/beauty themed, stable URLs

const productData = [
  // Cleansers
  {
    name: 'Gentle Foaming Cleanser',
    description:
      'A lightweight foaming cleanser that removes impurities without stripping the skin barrier. Suitable for all skin types.',
    price: 18.99,
    stock: 120,
    category: 'Cleansers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',
        alt: 'Gentle Foaming Cleanser',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Micellar Cleansing Water',
    description:
      'Effortlessly dissolves makeup and impurities. No-rinse formula enriched with rose water.',
    price: 14.99,
    stock: 95,
    category: 'Cleansers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631390220580-f4b71b510e59?w=600',
        alt: 'Micellar Water',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Cream-to-Foam Cleanser',
    description:
      'Luxurious cream texture that transforms into a rich foam. Enriched with ceramides and hyaluronic acid.',
    price: 22.5,
    stock: 80,
    category: 'Cleansers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
        alt: 'Cream Cleanser',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Salicylic Acid Face Wash',
    description:
      '2% salicylic acid formula to unclog pores and combat breakouts. Ideal for oily and acne-prone skin.',
    price: 16.99,
    stock: 110,
    category: 'Cleansers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228852-6d35a585d566?w=600',
        alt: 'Salicylic Cleanser',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Oil Balancing Gel Cleanser',
    description:
      'Mattifying gel cleanser that controls excess sebum production and minimises pores throughout the day.',
    price: 19.99,
    stock: 75,
    category: 'Cleansers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600',
        alt: 'Gel Cleanser',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Toners
  {
    name: 'Hydrating Rose Toner',
    description:
      'Alcohol-free toner infused with rose extract and niacinamide to soothe, hydrate and refine pores.',
    price: 21.0,
    stock: 90,
    category: 'Toners',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
        alt: 'Rose Toner',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'AHA/BHA Exfoliating Toner',
    description:
      'Chemical exfoliant toner with 5% AHA and 2% BHA to smooth texture and even skin tone.',
    price: 27.99,
    stock: 65,
    category: 'Toners',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614159978-0e5d57b02892?w=600',
        alt: 'Exfoliating Toner',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Green Tea Balancing Toner',
    description:
      'Antioxidant-rich green tea toner that balances oil production and protects against environmental stress.',
    price: 17.5,
    stock: 100,
    category: 'Toners',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        alt: 'Green Tea Toner',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Centella Calming Toner',
    description:
      'Fragrance-free centella asiatica toner for sensitive and reactive skin. Reduces redness and irritation.',
    price: 23.99,
    stock: 85,
    category: 'Toners',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
        alt: 'Centella Toner',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Serums
  {
    name: 'Vitamin C Brightening Serum',
    description:
      '15% stabilised vitamin C serum with ferulic acid. Visibly fades dark spots and boosts radiance in 2 weeks.',
    price: 44.99,
    stock: 60,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        alt: 'Vitamin C Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Hyaluronic Acid Plumping Serum',
    description:
      'Multi-molecular weight hyaluronic acid serum for deep and surface hydration. Plumps fine lines instantly.',
    price: 38.0,
    stock: 75,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600',
        alt: 'HA Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Retinol 0.3% Night Serum',
    description:
      'Encapsulated retinol serum for gentle cell turnover. Reduces wrinkles and improves skin texture overnight.',
    price: 52.0,
    stock: 45,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614159978-0e5d57b02892?w=600',
        alt: 'Retinol Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Niacinamide 10% + Zinc Serum',
    description:
      'High-strength niacinamide serum to minimise pores, control shine and fade blemish marks.',
    price: 12.99,
    stock: 200,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',
        alt: 'Niacinamide Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Peptide Firming Serum',
    description:
      'Advanced peptide complex that visibly lifts and firms sagging skin. Clinically proven to reduce wrinkle depth.',
    price: 68.0,
    stock: 35,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600',
        alt: 'Peptide Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Bakuchiol Plant Retinol Serum',
    description:
      'Natural bakuchiol serum — all the benefits of retinol without the irritation. Safe for sensitive skin and pregnancy.',
    price: 46.0,
    stock: 50,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
        alt: 'Bakuchiol Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Azelaic Acid 10% Serum',
    description:
      'Multi-tasking azelaic acid serum for rosacea, hyperpigmentation and congestion. Brightens and clarifies.',
    price: 29.99,
    stock: 70,
    category: 'Serums',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631390220580-f4b71b510e59?w=600',
        alt: 'Azelaic Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Moisturisers
  {
    name: 'Barrier Repair Cream',
    description:
      'Rich ceramide-packed cream that restores and strengthens the skin barrier. Ideal for dry and eczema-prone skin.',
    price: 34.99,
    stock: 90,
    category: 'Moisturisers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
        alt: 'Barrier Cream',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Oil-Free Gel Moisturiser',
    description:
      'Lightweight water-gel moisturiser for oily skin. Provides 24-hour hydration without clogging pores.',
    price: 28.0,
    stock: 110,
    category: 'Moisturisers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228852-6d35a585d566?w=600',
        alt: 'Gel Moisturiser',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Squalane Daily Moisturiser',
    description:
      "100% plant-derived squalane moisturiser that mimics skin's natural oils. Non-comedogenic and deeply nourishing.",
    price: 31.5,
    stock: 80,
    category: 'Moisturisers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600',
        alt: 'Squalane Moisturiser',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Rich Night Cream',
    description:
      'Overnight repair cream with shea butter, rosehip oil and retinyl palmitate. Wake up to visibly softer skin.',
    price: 42.0,
    stock: 55,
    category: 'Moisturisers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        alt: 'Night Cream',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'SPF 50 Daily Moisturiser',
    description:
      'Broad-spectrum SPF 50 moisturiser with a skin-like finish. Protects against UVA/UVB and blue light.',
    price: 36.99,
    stock: 130,
    category: 'Moisturisers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
        alt: 'SPF Moisturiser',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Collagen Boost Cream',
    description:
      'Stimulates natural collagen synthesis with bio-fermented ingredients. Firms and plumps mature skin.',
    price: 58.0,
    stock: 40,
    category: 'Moisturisers',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',
        alt: 'Collagen Cream',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Eye Care
  {
    name: 'Caffeine Eye Cream',
    description:
      'Depuffs and brightens the undereye area. Caffeine and vitamin K reduce dark circles and puffiness visibly.',
    price: 26.99,
    stock: 85,
    category: 'Eye Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631390220580-f4b71b510e59?w=600',
        alt: 'Eye Cream',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Peptide Eye Contour Serum',
    description:
      "Targeted eye serum with tripeptides and hyaluronic acid to smooth crow's feet and lift the eyelid area.",
    price: 48.0,
    stock: 45,
    category: 'Eye Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614159978-0e5d57b02892?w=600',
        alt: 'Eye Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Cooling Eye Gel',
    description:
      'Refreshing gel-texture eye treatment with cucumber and aloe vera. Reduces morning puffiness in minutes.',
    price: 19.99,
    stock: 95,
    category: 'Eye Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600',
        alt: 'Eye Gel',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Masks
  {
    name: 'Kaolin Clay Purifying Mask',
    description:
      'Deep-cleansing kaolin clay mask that draws out impurities, tightens pores and controls shine.',
    price: 24.99,
    stock: 100,
    category: 'Masks',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
        alt: 'Clay Mask',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Hydrogel Sheet Mask Set',
    description:
      'Pack of 5 hydrogel sheet masks infused with snail mucin and hyaluronic acid. Intense overnight hydration.',
    price: 22.0,
    stock: 150,
    category: 'Masks',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        alt: 'Sheet Masks',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Overnight Sleeping Mask',
    description:
      'No-rinse sleeping mask that works while you sleep. Wakes skin up with a glass-skin glow.',
    price: 32.0,
    stock: 70,
    category: 'Masks',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600',
        alt: 'Sleeping Mask',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Vitamin C Glow Mask',
    description:
      'Brightening mask with 10% vitamin C and turmeric extract. Restores luminosity in just 15 minutes.',
    price: 29.5,
    stock: 65,
    category: 'Masks',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
        alt: 'Vitamin C Mask',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Sunscreen
  {
    name: 'Mineral SPF 50 Sunscreen',
    description:
      'Zinc oxide mineral sunscreen with a lightweight, non-greasy finish. Reef-safe and fragrance-free.',
    price: 32.99,
    stock: 120,
    category: 'Sunscreen',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228852-6d35a585d566?w=600',
        alt: 'Mineral Sunscreen',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Invisible Sunscreen Fluid',
    description:
      'Ultra-lightweight SPF 50+ fluid sunscreen with a transparent finish. Perfect under makeup.',
    price: 27.99,
    stock: 140,
    category: 'Sunscreen',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
        alt: 'Invisible Sunscreen',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Tinted SPF 30 Sunscreen',
    description:
      'Lightly tinted SPF 30 sunscreen that evens skin tone and blurs imperfections. Suitable for all skin tones.',
    price: 29.0,
    stock: 95,
    category: 'Sunscreen',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631390220580-f4b71b510e59?w=600',
        alt: 'Tinted Sunscreen',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Exfoliants
  {
    name: 'Glycolic Acid 7% Toning Solution',
    description:
      'Daily exfoliating toner with 7% glycolic acid. Improves skin texture and radiance over time.',
    price: 14.99,
    stock: 180,
    category: 'Exfoliants',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614159978-0e5d57b02892?w=600',
        alt: 'Glycolic Toner',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Lactic Acid 10% Exfoliant',
    description:
      'Gentle lactic acid exfoliant suitable for sensitive skin. Smooths texture and brightens complexion.',
    price: 16.99,
    stock: 120,
    category: 'Exfoliants',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
        alt: 'Lactic Acid',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Enzyme Powder Exfoliant',
    description:
      'Papaya enzyme powder that activates with water for a gentle physical and enzymatic exfoliation.',
    price: 34.0,
    stock: 60,
    category: 'Exfoliants',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600',
        alt: 'Enzyme Exfoliant',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Face Oils
  {
    name: 'Rosehip Regenerating Oil',
    description:
      'Cold-pressed rosehip seed oil rich in vitamin A and omega fatty acids. Fades scars and brightens skin.',
    price: 38.99,
    stock: 70,
    category: 'Face Oils',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',
        alt: 'Rosehip Oil',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Marula Luxury Face Oil',
    description:
      'Lightweight marula oil packed with antioxidants and oleic acid. Absorbs instantly without greasiness.',
    price: 54.0,
    stock: 45,
    category: 'Face Oils',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        alt: 'Marula Oil',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Sea Buckthorn Glow Oil',
    description:
      'Bright orange sea buckthorn oil blend to restore glow to dull and tired-looking skin.',
    price: 42.0,
    stock: 50,
    category: 'Face Oils',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600',
        alt: 'Sea Buckthorn Oil',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Body Care
  {
    name: 'Shea Butter Body Lotion',
    description:
      'Rich shea butter body lotion with 48-hour moisturisation. Leaves skin silky soft and fragrant.',
    price: 18.99,
    stock: 200,
    category: 'Body Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
        alt: 'Body Lotion',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'AHA Body Scrub',
    description:
      'Exfoliating body scrub with glycolic acid and brown sugar. Smooths keratosis pilaris and dry patches.',
    price: 22.99,
    stock: 130,
    category: 'Body Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600',
        alt: 'Body Scrub',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Stretch Mark Body Oil',
    description:
      'Nourishing blend of bio oil and vitamin E to improve the appearance of stretch marks and scars.',
    price: 29.99,
    stock: 85,
    category: 'Body Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228852-6d35a585d566?w=600',
        alt: 'Body Oil',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Gradual Tanning Lotion',
    description:
      'Buildable tan body lotion with DHA and hyaluronic acid. Develops a natural golden glow in 4-6 hours.',
    price: 24.0,
    stock: 90,
    category: 'Body Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631390220580-f4b71b510e59?w=600',
        alt: 'Tanning Lotion',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Lip Care
  {
    name: 'Peptide Lip Serum',
    description:
      'Plumping lip serum with hyaluronic acid and collagen-boosting peptides. Visibly fuller lips in 4 weeks.',
    price: 21.99,
    stock: 110,
    category: 'Lip Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1614159978-0e5d57b02892?w=600',
        alt: 'Lip Serum',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'SPF Lip Balm Set',
    description:
      'Set of 3 tinted SPF 30 lip balms in nude, rose and berry. Moisturises and protects lips all day.',
    price: 16.5,
    stock: 160,
    category: 'Lip Care',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
        alt: 'Lip Balm Set',
        isPrimary: true,
        order: 0,
      },
    ],
  },

  // Tools
  {
    name: 'Rose Quartz Gua Sha',
    description:
      'Authentic rose quartz gua sha stone for lymphatic drainage and facial sculpting. Includes technique guide.',
    price: 29.99,
    stock: 75,
    category: 'Tools',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600',
        alt: 'Gua Sha',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Jade Roller',
    description:
      'Dual-ended jade facial roller to depuff and boost product absorption. Cooling on application.',
    price: 19.99,
    stock: 95,
    category: 'Tools',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
        alt: 'Jade Roller',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'LED Light Therapy Mask',
    description:
      'At-home LED mask with red and blue light modes for anti-ageing and acne treatment. FDA-cleared.',
    price: 149.0,
    stock: 20,
    category: 'Tools',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600',
        alt: 'LED Mask',
        isPrimary: true,
        order: 0,
      },
    ],
  },
  {
    name: 'Silicone Facial Cleansing Brush',
    description:
      'Waterproof sonic cleansing brush with ultra-soft silicone bristles. 3 intensity settings for deep cleansing.',
    price: 34.99,
    stock: 60,
    category: 'Tools',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600',
        alt: 'Cleansing Brush',
        isPrimary: true,
        order: 0,
      },
    ],
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────

const firstNames = [
  'Sofia',
  'Emma',
  'Olivia',
  'Ava',
  'Isabella',
  'Mia',
  'Luna',
  'Aria',
  'Zoe',
  'Chloe',
  'Lea',
  'Nora',
  'Elena',
  'Maya',
  'Sara',
  'Julia',
  'Laura',
  'Ana',
  'Nina',
  'Isla',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Wilson',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Lee',
  'Moore',
  'Clark',
];
const cities = [
  'Tirana',
  'London',
  'Paris',
  'Berlin',
  'Rome',
  'Madrid',
  'Amsterdam',
  'Vienna',
  'Lisbon',
  'Prague',
];

const userData = [
  {
    firstName: 'Admin',
    lastName: 'User',
    userName: 'admin',
    email: 'admin@glowskin.com',
    password: 'admin123',
    role: 'admin',
  },
  ...firstNames.map((firstName, i) => ({
    firstName,
    lastName: lastNames[i],
    userName: `${firstName.toLowerCase()}${lastNames[i].toLowerCase().slice(0, 3)}`,
    email: `${firstName.toLowerCase()}.${lastNames[i].toLowerCase()}@example.com`,
    password: 'password123',
    role: 'customer',
  })),
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✔ Connected to MongoDB');

  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('✔ Cleared collections');

  const products = await Product.insertMany(productData);
  console.log(`✔ Inserted ${products.length} products`);

  const hashedUsers = await Promise.all(
    userData.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    })),
  );
  const users = await User.insertMany(hashedUsers);
  console.log(`✔ Inserted ${users.length} users`);

  // Wishlists for customers
  const customers = users.filter((u) => u.role === 'customer');
  await Promise.all(
    customers.map((c) =>
      User.updateOne(
        { _id: c._id },
        { wishlist: pickN(products, randInt(2, 6)).map((p) => p._id) },
      ),
    ),
  );

  // 10 orders spread across random customers
  const statuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'delivered',
    'delivered',
  ];
  const paymentMethods = ['card', 'paypal', 'cash'];
  const orders = await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) => {
      const customer = pick(customers);
      const city = pick(cities);
      const orderItems = pickN(products, randInt(1, 4));
      const status = statuses[i % statuses.length];
      const isPaid = ['delivered', 'shipped'].includes(status);

      const items = orderItems.map((p) => {
        const qty = randInt(1, 3);
        return {
          productId: p._id,
          productName: p.name,
          productImage: (p.images as any[])[0]?.url ?? '',
          quantity: qty,
          priceAtPurchase: p.price,
          subtotal: round2(p.price * qty),
        };
      });

      const subtotal = round2(items.reduce((s, it) => s + it.subtotal, 0));
      const shipping = 4.99;
      const tax = round2(subtotal * 0.1);
      const total = round2(subtotal + shipping + tax);

      return Order.create({
        user: customer._id,
        items,
        pricing: { subtotal, shipping, tax, discount: 0, total },
        status,
        statusHistory: [
          { status: 'pending', changedAt: new Date(), note: 'Order placed' },
        ],
        shippingAddress: {
          street: `${randInt(1, 200)} Main Street`,
          city,
          country: 'Albania',
          zip: `${randInt(1000, 9999)}`,
          state: '',
        },
        payment: {
          method: pick(paymentMethods),
          status: isPaid ? 'paid' : 'unpaid',
          transactionId: isPaid
            ? `txn_${Math.random().toString(36).slice(2, 10)}`
            : '',
        },
        tracking: isPaid
          ? {
              carrier: 'DHL',
              trackingNumber: `DHL${randInt(100000, 999999)}`,
              estimatedDelivery: new Date(Date.now() + 3 * 86400000),
            }
          : {},
        ...(isPaid ? { paidAt: new Date() } : {}),
        ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
      });
    }),
  );
  console.log(`✔ Inserted ${orders.length} orders`);

  console.log('\n─────────────────────────────────');
  console.log('Admin  →  admin@glowskin.com  /  admin123');
  console.log('Customer  →  sofia.smith@example.com  /  password123');
  console.log('─────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
