import express from 'express';
import Product from '../models/Product.js';
import Sales from '../models/Sales.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all products with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock products
router.get('/alerts/low-stock', auth, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buy product
router.post('/:id/buy', auth, async (req, res) => {
  try {
    const { quantity, phone, address, notes, paymentMethod } = req.body;
    const qty = parseInt(quantity) || 1;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Decrement stock and adjust stats
    product.stock -= qty;
    if (product.stock < 10) {
      product.isLowStock = true;
    }
    
    product.salesCount = (product.salesCount || 0) + qty;
    const finalUnitPrice = product.price * (1 - (product.discount || 0) / 100);
    const saleRevenue = qty * finalUnitPrice;
    product.revenue = (product.revenue || 0) + saleRevenue;
    
    await product.save();

    // Create a new sales document
    const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const sale = new Sales({
      orderId,
      product: product._id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.price,
      totalAmount: qty * product.price,
      discount: product.discount || 0,
      finalAmount: saleRevenue,
      status: 'completed',
      paymentMethod: paymentMethod || 'Credit Card',
      customerEmail: req.user.email,
      customerPhone: phone || '',
      shippingAddress: address || '',
      notes: notes || '',
    });

    await sale.save();

    res.status(201).json({
      message: 'Purchase completed successfully',
      sale,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Checkout multiple products (Shopping Cart Checkout)
router.post('/checkout', auth, async (req, res) => {
  try {
    const { items, phone, address, notes, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or items format is invalid' });
    }

    // Step 1: Validate stock for all items first
    const checkedProducts = [];
    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity) || 1;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${productId} not found` });
      }

      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock available for ${product.name}` });
      }
      checkedProducts.push({ product, qty });
    }

    // Step 2: Generate base order ID
    const baseOrderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const salesCreated = [];
    const productsUpdated = [];

    // Step 3: Perform updates and create sales documents
    for (let index = 0; index < checkedProducts.length; index++) {
      const { product, qty } = checkedProducts[index];

      // Decrement stock and adjust stats
      product.stock -= qty;
      if (product.stock < 10) {
        product.isLowStock = true;
      }

      product.salesCount = (product.salesCount || 0) + qty;
      const finalUnitPrice = product.price * (1 - (product.discount || 0) / 100);
      const saleRevenue = qty * finalUnitPrice;
      product.revenue = (product.revenue || 0) + saleRevenue;

      await product.save();
      productsUpdated.push(product);

      // Create sales record. To ensure orderId uniqueness in schema, append index to the base master orderId
      const uniqueOrderId = checkedProducts.length > 1 ? `${baseOrderId}-${index}` : baseOrderId;

      const sale = new Sales({
        orderId: uniqueOrderId,
        product: product._id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.price,
        totalAmount: qty * product.price,
        discount: product.discount || 0,
        finalAmount: saleRevenue,
        status: 'completed',
        paymentMethod: paymentMethod || 'Credit Card',
        customerEmail: req.user.email,
        customerPhone: phone || '',
        shippingAddress: address || '',
        notes: notes || '',
      });

      await sale.save();
      salesCreated.push(sale);
    }

    res.status(201).json({
      message: 'Purchase completed successfully',
      orderId: baseOrderId,
      sales: salesCreated,
      products: productsUpdated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

