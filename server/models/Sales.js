import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: String,
  quantity: { type: Number, required: true },
  unitPrice: Number,
  totalAmount: Number,
  discount: { type: Number, default: 0 },
  finalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: String,
  customerEmail: String,
  customerPhone: String,
  shippingAddress: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Sales', salesSchema);
