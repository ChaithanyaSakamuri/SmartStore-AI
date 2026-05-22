import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, Phone, MapPin, FileText, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';

const InvoiceModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  // Calculate breakdown stats
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountTotal = items.reduce((sum, item) => sum + ((item.unitPrice * (item.discount || 0) / 100) * item.quantity), 0);
  const grandTotal = order.totalAmount;

  // Define steps for the timeline
  const getTimelineSteps = (status) => {
    if (status === 'cancelled') {
      return [
        { label: 'Ordered', desc: 'Order received successfully', completed: true, active: false, error: false },
        { label: 'Cancelled', desc: 'Order transaction voided', completed: false, active: true, error: true }
      ];
    }

    const isCompleted = status === 'completed';
    const isPending = status === 'pending' || !status;

    return [
      { 
        label: 'Ordered', 
        desc: 'Order received & confirmed', 
        completed: true, 
        active: false, 
        icon: CheckCircle2 
      },
      { 
        label: 'Processing', 
        desc: isCompleted ? 'Order packed and dispatched' : 'Preparing high-fidelity gear', 
        completed: isCompleted, 
        active: isPending, 
        icon: Truck 
      },
      { 
        label: 'Completed', 
        desc: isCompleted ? 'Delivered & signed successfully' : 'Awaiting delivery dispatch', 
        completed: isCompleted, 
        active: false, 
        icon: CheckCircle2 
      }
    ];
  };

  const steps = getTimelineSteps(order.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/40 p-6">
              <div>
                <h3 className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  SMARTSTORE RECEIPT
                </h3>
                <p className="text-xs text-gray-400 font-semibold font-mono mt-1">Ref: {order.orderId}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Order Status Timeline Banner */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Fulfillment Pipeline</h4>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon || AlertCircle;
                    return (
                      <div key={idx} className="flex md:flex-col items-center gap-3 md:text-center flex-1 relative z-10">
                        {/* Progress Line connectors (Desktop only) */}
                        {idx < steps.length - 1 && (
                          <div className="hidden md:block absolute top-5 left-[60%] right-[-40%] h-[2px] bg-gradient-to-r from-white/10 to-white/10 pointer-events-none">
                            <div 
                              className={`h-full ${
                                step.completed 
                                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                                  : 'bg-transparent'
                              }`} 
                              style={{ width: step.completed ? '100%' : '0%' }}
                            />
                          </div>
                        )}

                        {/* Icon Node */}
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm transition-all ${
                            step.error
                              ? 'bg-red-500/20 border-red-500 text-red-400'
                              : step.completed
                              ? 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/10'
                              : step.active
                              ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/25 animate-pulse'
                              : 'bg-slate-900 border-white/10 text-gray-500'
                          }`}
                        >
                          {step.error ? <AlertCircle size={18} /> : <StepIcon size={18} />}
                        </div>

                        {/* Details */}
                        <div className="text-left md:text-center mt-1">
                          <p className={`text-sm font-bold ${
                            step.error 
                              ? 'text-red-400' 
                              : step.completed 
                              ? 'text-green-400' 
                              : step.active 
                              ? 'text-blue-400' 
                              : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-[160px]">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Order Metadata & Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meta details */}
                <div className="rounded-xl bg-slate-950/30 border border-white/5 p-4 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Calendar size={16} className="text-blue-400" />
                    <span className="text-xs font-semibold uppercase">Purchase Date</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-7">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  <div className="flex items-center gap-2.5 text-gray-400 pt-2">
                    <CreditCard size={16} className="text-purple-400" />
                    <span className="text-xs font-semibold uppercase">Payment Mode</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-7 capitalize">
                    {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'Credit Card'}
                  </p>
                </div>

                {/* Shipping Details */}
                <div className="rounded-xl bg-slate-950/30 border border-white/5 p-4 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-gray-400">
                    <MapPin size={16} className="text-emerald-400" />
                    <span className="text-xs font-semibold uppercase">Delivery Address</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-7 leading-relaxed">
                    {order.shippingAddress || 'Digital Product Delivery / Not Provided'}
                  </p>

                  <div className="flex items-center gap-2.5 text-gray-400 pt-2">
                    <Phone size={16} className="text-amber-400" />
                    <span className="text-xs font-semibold uppercase">Customer Contact</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-7 font-mono">
                    {order.customerPhone || 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* Order Notes (If Any) */}
              {order.notes && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 flex gap-3">
                  <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Customer Delivery Instructions</h5>
                    <p className="text-sm text-amber-100/80 italic">"{order.notes}"</p>
                  </div>
                </div>
              )}

              {/* Itemized Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-slate-950/40 px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Itemized Breakdown</span>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-950/20 text-gray-400 text-xs font-bold uppercase">
                      <th className="px-4 py-3">Product Spec</th>
                      <th className="px-4 py-3 text-center">Price</th>
                      <th className="px-4 py-3 text-center">Discount</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-gray-300">
                          ${item.unitPrice?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.discount > 0 ? (
                            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs font-bold border border-amber-500/20">
                              {item.discount}% Off
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white font-mono">
                          ${item.finalAmount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summaries */}
              <div className="w-full max-w-sm ml-auto border border-white/10 rounded-xl bg-slate-950/40 p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Applied Discounts:</span>
                    <span className="font-mono font-bold">-${discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-[1px] bg-white/10 my-2" />
                <div className="flex justify-between items-center text-base font-extrabold">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Grand Total:</span>
                  <span className="font-mono text-2xl text-white">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-950/40 border-t border-white/10 px-6 py-4 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-semibold">Thank you for choosing SmartStore AI!</span>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2 rounded-xl transition-colors shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-transform"
              >
                Close Receipt
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InvoiceModal;
