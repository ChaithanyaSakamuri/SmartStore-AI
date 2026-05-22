import { useState, useEffect, useContext } from 'react';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { 
  X, 
  Minus, 
  Plus, 
  CreditCard, 
  Truck, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

const ProductImage = ({ src, alt, category }) => {
  const [error, setError] = useState(false);
  const gradients = {
    Electronics: 'from-blue-600 to-cyan-500',
    Audio: 'from-purple-600 to-indigo-500',
    Accessories: 'from-pink-600 to-rose-500',
    Peripherals: 'from-emerald-600 to-teal-500',
    Storage: 'from-amber-600 to-orange-500',
    Displays: 'from-violet-600 to-fuchsia-500',
    Camera: 'from-red-600 to-pink-500',
    default: 'from-slate-700 to-slate-600'
  };
  const gradient = gradients[category] || gradients.default;

  if (error || !src) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white/50 text-xs font-bold font-mono rounded-lg`}>
        {alt ? alt.substring(0, 2).toUpperCase() : 'SP'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full h-full object-cover rounded-lg"
    />
  );
};

const PurchaseModal = ({ isOpen, onClose, product, isCartCheckout = false, onPurchaseSuccess }) => {
  const { cartItems, clearCart, cartFinalTotal, cartTotal, cartDiscountTotal, removeFromCart } = useContext(CartContext);

  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');
  const [purchasedItems, setPurchasedItems] = useState([]);

  // Credit Card details states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setPhone('');
      setAddress('');
      setNotes('');
      setPaymentMethod('Credit Card');
      setPurchaseSuccess(false);
      setOrderResult(null);
      setError('');
      setPurchasedItems([]);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!isCartCheckout && !product) return null;
  if (isCartCheckout && cartItems.length === 0) return null;

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!address.trim()) {
      setError('Shipping address is required');
      return;
    }

    if (paymentMethod === 'Credit Card') {
      if (!cardName.trim()) {
        setError('Cardholder name is required');
        return;
      }
      if (!cardNumber.trim()) {
        setError('Card number is required');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Invalid card number (must be 16 digits)');
        return;
      }
      if (!cardExpiry.trim()) {
        setError('Card expiry date is required');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError('Invalid expiry format (use MM/YY)');
        return;
      }
      if (!cardCvv.trim()) {
        setError('CVV code is required');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Invalid CVV (must be 3 digits)');
        return;
      }
    }

    setError('');
    setIsLoading(true);

    try {
      if (isCartCheckout) {
        // Multi-item cart checkout
        const response = await api.post('/products/checkout', {
          items: cartItems.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          phone,
          address,
          notes,
          paymentMethod,
        });

        setOrderResult(response.data);
        setPurchasedItems([...cartItems]);
        setPurchaseSuccess(true);
        clearCart();
        alert('Order Successful!');
        
        if (onPurchaseSuccess) {
          onPurchaseSuccess(response.data.products);
        }
      } else {
        // Single-item quick checkout
        const response = await api.post(`/products/${product._id}/buy`, {
          quantity,
          phone,
          address,
          notes,
          paymentMethod,
        });

        setOrderResult(response.data.sale);
        setPurchasedItems([{ product, quantity }]);
        setPurchaseSuccess(true);
        alert('Order Successful!');
        
        if (onPurchaseSuccess) {
          onPurchaseSuccess([response.data.product]);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Transaction failed. Please try again.';
      setError(errMsg);
      
      // Self-healing cart: Automatically remove invalid product IDs if they are missing from the catalog
      if (errMsg.includes('not found') && errMsg.includes('Product with ID')) {
        const match = errMsg.match(/Product with ID ([a-f0-9]+) not found/i);
        if (match && match[1]) {
          const invalidProductId = match[1];
          removeFromCart(invalidProductId);
          setError('Some items in your cart are no longer available in the catalog and have been removed. Please review your order and try checkout again.');
        }
      } else if (errMsg === 'Product not found') {
        if (!isCartCheckout && product) {
          setError('This product is no longer available in our store catalog.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = isCartCheckout ? cartTotal : quantity * product.price;
  const discountAmount = isCartCheckout ? cartDiscountTotal : subtotal * ((product.discount || 0) / 100);
  const finalTotal = isCartCheckout ? cartFinalTotal : subtotal - discountAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <framerMotion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      ></framerMotion.div>

      {/* Modal Dialog */}
      <framerMotion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-xl bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden my-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 py-3.5 border-b border-white/10 bg-slate-950/40">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" /> 
            {purchaseSuccess ? 'Order Confirmed!' : 'Express Checkout'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {purchaseSuccess ? (
          /* Success Screen */
          <framerMotion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center flex flex-col items-center"
          >
            <framerMotion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30"
            >
              <CheckCircle2 className="w-10 h-10" />
            </framerMotion.div>

            <h4 className="text-2xl font-bold text-white mb-2">Thank you for your order!</h4>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              Your transaction was processed successfully. A confirmation receipt has been sent to your account.
            </p>

            <div className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-5 mb-8 text-left space-y-3 font-medium">
              <div className="flex justify-between text-sm border-b border-white/5 pb-2.5">
                <span className="text-gray-500">Order Reference</span>
                <span className="font-mono text-gray-300 font-bold">
                  {isCartCheckout ? orderResult?.orderId : orderResult?.orderId}
                </span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/5 pb-2.5">
                <span className="text-gray-500">Items purchased</span>
                <div className="text-right text-gray-300 max-w-[280px] max-h-[120px] overflow-y-auto pr-1 space-y-1">
                  {purchasedItems.map((item) => (
                    <div key={item.product._id} className="text-xs font-semibold">
                      {item.product.name} (x{item.quantity})
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-sm border-b border-white/5 pb-2.5">
                <span className="text-gray-500">Payment method</span>
                <span className="text-gray-300">{paymentMethod}</span>
              </div>
              <div className="pt-2 flex justify-between text-base">
                <span className="text-white font-semibold">Total paid</span>
                <span className="text-green-400 font-extrabold text-lg">
                  ${finalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Continue Shopping
            </button>
          </framerMotion.div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 p-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Brief / Cart Items list */}
              <div className="space-y-3 bg-slate-950/30 border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Summary</h4>
                  {isCartCheckout ? (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div key={item.product._id} className="flex items-center gap-2.5 bg-white/5 border border-white/5 rounded-lg p-2">
                          <div className="w-10 h-10 flex-shrink-0">
                            <ProductImage src={item.product.image} alt={item.product.name} category={item.product.category} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{item.product.name}</h5>
                            <span className="text-[10px] text-gray-400">Qty: {item.quantity} × ${item.product.price}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-white">
                              ${(item.product.price * item.quantity * (1 - (item.product.discount || 0) / 100)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2.5">
                        <div className="w-12 h-12 flex-shrink-0">
                          <ProductImage src={product.image} alt={product.name} category={product.category} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{product.category || 'Retail'}</span>
                          <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">{product.name}</h4>
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-xs text-gray-400 font-semibold">Price per unit</span>
                        <div className="text-right">
                          <span className="text-white font-bold text-sm">${product.price}</span>
                          {product.discount > 0 && (
                            <span className="block text-[10px] text-green-400 font-semibold">-{product.discount}% OFF</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <div className="space-y-0.5">
                          <span className="text-xs text-gray-400 font-semibold block">Select Quantity</span>
                          <span className="text-[10px] text-gray-500 block">Available: {product.stock} left</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-white font-bold text-xs select-none">{quantity}</span>
                          <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={quantity >= product.stock}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtotals Panel */}
                <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount Saved</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-2.5 flex justify-between text-sm font-bold">
                    <span className="text-white flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Total Pay
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-extrabold text-base">
                      ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              {/* Delivery Details */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                    required
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-400" /> Shipping Address
                  </label>
                  <textarea
                    placeholder="Enter full address details (street, suite, zip code)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs min-h-[72px] resize-none"
                    required
                  />
                </div>
 
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Delivery Notes (Optional)
                  </label>
                  <textarea
                    placeholder="E.g., Leave package on the porch"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs min-h-[48px] h-[48px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              <label className="text-xs font-semibold text-gray-300 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['Credit Card', 'PayPal', 'SmartPay'].map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <CreditCard className={`w-3.5 h-3.5 mb-0.5 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credit Card Input Form */}
            {paymentMethod === 'Credit Card' && (
              <framerMotion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 border-t border-white/10 pt-3 text-left"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 1234 5678"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(val.substring(0, 19));
                    }}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\//g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardExpiry(val.substring(0, 5));
                      }}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">CVV</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCardCvv(val.substring(0, 3));
                      }}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                      required
                    />
                  </div>
                </div>
              </framerMotion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3.5 border-t border-white/10 pt-3 bg-slate-950/10 -mx-5 -mb-5 p-4">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 border border-white/15 hover:bg-white/5 text-white font-bold py-2 px-3 rounded-xl transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (!isCartCheckout && product.stock <= 0)}
                className="w-2/3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] text-xs"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Confirm Purchase</>
                )}
              </button>
            </div>
          </form>
        )}
      </framerMotion.div>
    </div>
  );
};

export default PurchaseModal;
export { ProductImage };
