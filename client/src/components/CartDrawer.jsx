import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { ProductImage } from './PurchaseModal';
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartCount, 
    cartTotal, 
    cartDiscountTotal, 
    cartFinalTotal 
  } = useContext(CartContext);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          {/* Slider Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-md"
          >
            <div className="h-full flex flex-col bg-slate-900/95 border-l border-white/20 shadow-2xl backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none">Your Cart</h2>
                    <p className="text-xs text-gray-400 mt-1">{cartCount} {cartCount === 1 ? 'item' : 'items'} ready to ship</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-950/60 border border-white/5 rounded-full flex items-center justify-center text-gray-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Your cart is empty</h3>
                      <p className="text-gray-400 text-xs mt-1.5 max-w-xs leading-relaxed">
                        Add items from our catalog to get started. Low-stock limits and active coupon deductions will apply automatically!
                      </p>
                    </div>
                  </div>
                ) : (
                  cartItems.map(({ product, quantity }) => {
                    const finalPrice = product.price * (1 - (product.discount || 0) / 100);
                    const originalTotal = product.price * quantity;
                    const discountedTotal = finalPrice * quantity;

                    return (
                      <motion.div
                        layout
                        key={product._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-3.5 transition-all group"
                      >
                        {/* Photo Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-lg bg-slate-950/50">
                          <ProductImage src={product.image} alt={product.name} category={product.category} />
                          {product.discount > 0 && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-[8px] font-extrabold px-1 py-0.5 rounded-sm">
                              -{product.discount}%
                            </div>
                          )}
                        </div>

                        {/* Detail Block */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{product.category}</span>
                              <button
                                onClick={() => removeFromCart(product._id)}
                                className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <h4 className="text-sm font-bold text-white truncate -mt-0.5 leading-tight">{product.name}</h4>
                          </div>

                          {/* Control Bar & Dynamic Price */}
                          <div className="flex justify-between items-center mt-2.5">
                            <div className="flex items-center gap-1 bg-slate-950 border border-white/10 rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(product._id, quantity - 1)}
                                disabled={quantity <= 1}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-white font-bold text-xs select-none">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product._id, quantity + 1)}
                                disabled={quantity >= product.stock}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              {product.discount > 0 && (
                                <span className="block text-[10px] text-gray-500 line-through">
                                  ${originalTotal.toFixed(2)}
                                </span>
                              )}
                              <span className="text-sm font-extrabold text-white">
                                ${discountedTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Summary Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-white/15 p-5 bg-slate-950/50 space-y-4">
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">${cartTotal.toFixed(2)}</span>
                    </div>

                    {cartDiscountTotal > 0 && (
                      <div className="flex justify-between text-green-400 font-semibold items-center">
                        <span className="flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> Bundle Discount
                        </span>
                        <span>-${cartDiscountTotal.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t border-white/5 pt-3 flex justify-between text-sm font-bold">
                      <span className="text-white">Total Pay</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-extrabold text-lg">
                        ${cartFinalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CartDrawer;
