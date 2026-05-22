import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  originalPrice: Number,
  discount: { type: Number, default: 0 },
  category: String,
  brand: String,
  image: String,
  images: [String],
  stock: { type: Number, default: 0 },
  sku: String,
  tags: [String],
  seoKeywords: [String],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isLowStock: { type: Boolean, default: false },
  aiGenerated: {
    description: String,
    tags: [String],
    marketingCaption: String,
    instagramCaption: String,
    suggestedPrice: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
