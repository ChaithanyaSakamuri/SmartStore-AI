import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSkeletons from '../components/LoadingSkeletons';
import api from '../services/api';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  MapPin, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/admin/orders');
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term & status filter
  useEffect(() => {
    let result = orders;

    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.shippingAddress.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/dashboard/admin/orders/${orderId}/status`, { status: newStatus });
      // Update local state instantly
      setOrders(prevOrders => 
        prevOrders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please verify permissions.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'cancelled':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'pending':
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-2.5">
              <ShoppingBag className="w-8 h-8 text-blue-500" /> Orders Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">Review customer sales invoices, track shipments, and update order statuses.</p>
          </div>
          
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2.5 rounded-xl font-semibold transition-all self-start sm:self-auto hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3.5 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Email, Shipping Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 focus:bg-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-gray-300 outline-none cursor-pointer transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table/List Container */}
        {loading ? (
          <LoadingSkeletons />
        ) : filteredOrders.length === 0 ? (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mb-4 stroke-[1.5]" />
            <p className="text-gray-300 text-lg mb-2 font-medium">No customer orders matching parameters</p>
            <p className="text-gray-500 text-sm max-w-sm">There are no sales matching your search query or status filters at this moment.</p>
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs font-semibold uppercase bg-slate-950/60 tracking-wider">
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4 text-center">Items</th>
                    <th className="px-6 py-4 text-right pr-12">Grand Total</th>
                    <th className="px-6 py-4 text-center">Date</th>
                    <th className="px-6 py-4 text-center">Fulfillment Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.orderId;
                    const isUpdating = updatingOrderId === order.orderId;

                    return (
                      <>
                        <tr key={order.orderId} className={`hover:bg-white/5 transition-colors group ${isExpanded ? 'bg-white/5' : ''}`}>
                          {/* Order Reference */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleExpandOrder(order.orderId)}
                              className="font-mono text-sm font-bold text-gray-400 group-hover:text-blue-400 transition-colors flex items-center gap-1.5"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              {order.orderId}
                            </button>
                          </td>

                          {/* Customer Details */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white text-sm">{order.customerEmail}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{order.customerPhone || 'No Phone'}</p>
                          </td>

                          {/* Item count */}
                          <td className="px-6 py-4 text-center font-bold text-white text-sm">
                            {order.quantity} {order.quantity === 1 ? 'item' : 'items'}
                          </td>

                          {/* Total amount */}
                          <td className="px-6 py-4 text-right pr-12 font-bold text-white font-mono text-sm">
                            ${order.totalAmount?.toFixed(2)}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-center text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                order.status === 'completed' 
                                  ? 'bg-green-400' 
                                  : order.status === 'cancelled'
                                  ? 'bg-red-400'
                                  : 'bg-amber-400 animate-ping'
                              }`} />
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status}</span>
                            </span>
                          </td>

                          {/* Actions / Dropdown status controller */}
                          <td className="px-6 py-4 text-center">
                            <div className="relative inline-block text-left">
                              <select
                                value={order.status}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                                className={`bg-slate-900 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-300 outline-none cursor-pointer capitalize transition-all ${
                                  isUpdating ? 'opacity-50 cursor-wait' : ''
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr key={`${order.orderId}-expanded`}>
                              <td colSpan={7} className="px-6 py-4 bg-slate-950/40 border-t border-b border-white/5">
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm"
                                >
                                  {/* Shipping info */}
                                  <div className="space-y-2">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-blue-400">Delivery Information</h5>
                                    <div className="flex gap-2 text-gray-300">
                                      <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" />
                                      <p>{order.shippingAddress || 'Digital Product / N/A'}</p>
                                    </div>
                                    <div className="flex gap-2 text-gray-300 pt-1">
                                      <Phone size={16} className="text-gray-500 shrink-0" />
                                      <p className="font-mono">{order.customerPhone || 'Not Provided'}</p>
                                    </div>
                                    <div className="flex gap-2 text-gray-300 pt-1">
                                      <CreditCard size={16} className="text-gray-500 shrink-0" />
                                      <p className="capitalize">Mode: {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'Credit Card'}</p>
                                    </div>
                                  </div>

                                  {/* Order Notes */}
                                  <div className="space-y-2 border-l border-white/10 pl-6">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">Special Notes</h5>
                                    <p className="text-gray-300 italic">
                                      {order.notes ? `"${order.notes}"` : 'No customer instructions provided.'}
                                    </p>
                                  </div>

                                  {/* Order item details */}
                                  <div className="space-y-2 border-l border-white/10 pl-6">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-purple-400">Item Breakdown</h5>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                      {order.items.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                                          <div>
                                            <p className="font-bold text-white">{item.productName}</p>
                                            <p className="text-gray-500 font-mono mt-0.5">
                                              Qty: {item.quantity} x ${item.unitPrice} {item.discount > 0 && `(${item.discount}% off)`}
                                            </p>
                                          </div>
                                          <span className="font-mono font-bold text-white">${item.finalAmount?.toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
