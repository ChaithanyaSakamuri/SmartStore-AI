import express from 'express';
import Product from '../models/Product.js';
import Sales from '../models/Sales.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Helper to get base order ID for multi-item checkouts
const getBaseOrderId = (orderId) => {
  if (!orderId) return '';
  const parts = orderId.split('-');
  // If it has 4 parts (e.g. ORD-timestamp-random-index), it is a multi-item order, strip the index
  if (parts.length === 4) {
    return parts.slice(0, 3).join('-');
  }
  return orderId;
};

// Helper to group Sales documents by their base order ID
const groupSales = (sales) => {
  const groupedMap = new Map();

  for (const sale of sales) {
    const orderId = sale.orderId;
    const baseId = getBaseOrderId(orderId);

    if (!groupedMap.has(baseId)) {
      groupedMap.set(baseId, {
        orderId: baseId,
        customerEmail: sale.customerEmail,
        customerPhone: sale.customerPhone || '',
        shippingAddress: sale.shippingAddress || '',
        notes: sale.notes || '',
        paymentMethod: sale.paymentMethod || 'Credit Card',
        status: sale.status || 'pending',
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
        items: [],
        totalAmount: 0,
        quantity: 0
      });
    }

    const group = groupedMap.get(baseId);
    
    group.items.push({
      _id: sale._id,
      originalOrderId: sale.orderId,
      product: sale.product,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      discount: sale.discount || 0,
      finalAmount: sale.finalAmount
    });

    group.totalAmount += sale.finalAmount || 0;
    group.quantity += sale.quantity || 0;
    group.status = sale.status || group.status;
  }

  return Array.from(groupedMap.values());
};


// Get analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sales.countDocuments();
    const totalRevenue = await Sales.aggregate([
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);

    const monthlyRevenue = await Sales.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$finalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalProducts,
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top products
router.get('/top-products', auth, async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ salesCount: -1 })
      .limit(5);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get revenue data
router.get('/revenue', auth, async (req, res) => {
  try {
    const revenueData = await Sales.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$finalAmount' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    res.json(revenueData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in user's orders (Grouped by master transaction ID)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const sales = await Sales.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(groupSales(sales));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in user's stats (Using grouped orders count)
router.get('/my-stats', auth, async (req, res) => {
  try {
    const email = req.user.email;
    const sales = await Sales.find({ customerEmail: email });

    const totalSpent = sales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0);
    const groupedOrders = groupSales(sales);
    const ordersCount = groupedOrders.length;

    // Unique products bought
    const uniqueProductIds = new Set(sales.map(s => s.product?.toString()).filter(Boolean));
    const itemsBought = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);

    res.json({
      totalSpent,
      ordersCount,
      uniqueProductsBought: uniqueProductIds.size,
      itemsBought,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all orders grouped by master transaction ID
router.get('/admin/orders', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const sales = await Sales.find().sort({ createdAt: -1 });
    res.json(groupSales(sales));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update order status for a grouped order
router.put('/admin/orders/:orderId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const orderId = req.params.orderId;

    // Update all sales that match orderId exactly or share the same baseOrderId (starts with baseOrderId-)
    const result = await Sales.updateMany(
      {
        $or: [
          { orderId: orderId },
          { orderId: { $regex: `^${orderId}-` } }
        ]
      },
      {
        $set: { status, updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No orders found matching the provided reference' });
    }

    res.json({
      message: `Order status updated to ${status} successfully`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
