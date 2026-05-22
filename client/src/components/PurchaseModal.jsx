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
  Sparkles,
  Package,
  Copy,
  PartyPopper
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

  // PayPal & SmartPay (UPI) details states
  const [paypalEmail, setPaypalEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paypalOption, setPaypalOption] = useState('PayPal Wallet'); // 'PayPal Wallet', 'Credit/Debit Card', 'UPI / Smart Pay'
  const [finalPaymentMethod, setFinalPaymentMethod] = useState('Credit Card');

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
      setPaypalEmail('');
      setUpiId('');
      setPaypalOption('PayPal Wallet');
      setFinalPaymentMethod('Credit Card');
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
    } else if (paymentMethod === 'PayPal') {
      if (paypalOption === 'PayPal Wallet') {
        if (!paypalEmail.trim()) {
          setError('PayPal Email/Mobile Number is required');
          return;
        }
        if (paypalEmail.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
          setError('Please enter a valid PayPal Email Address');
          return;
        }
      } else if (paypalOption === 'Credit/Debit Card') {
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
      } else if (paypalOption === 'UPI / Smart Pay') {
        if (!upiId.trim()) {
          setError('SmartPay UPI ID is required');
          return;
        }
        if (!upiId.includes('@')) {
          setError('Invalid UPI ID format (e.g. username@upi)');
          return;
        }
      }
    } else if (paymentMethod === 'SmartPay') {
      if (!upiId.trim()) {
        setError('SmartPay UPI ID is required');
        return;
      }
      if (!upiId.includes('@')) {
        setError('Invalid UPI ID format (e.g. username@upi)');
        return;
      }
    }

    setError('');
    setIsLoading(true);

    const computedPaymentMethod = paymentMethod === 'PayPal' ? `PayPal (${paypalOption})` : paymentMethod;
    setFinalPaymentMethod(computedPaymentMethod);

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
          paymentMethod: computedPaymentMethod,
        });

        setOrderResult(response.data);
        setPurchasedItems([...cartItems]);
        clearCart();
        setPurchaseSuccess(true);
        
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
          paymentMethod: computedPaymentMethod,
        });

        setOrderResult(response.data.sale);
        setPurchasedItems([{ product, quantity }]);
        setPurchaseSuccess(true);
        
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

  const [copiedOrderId, setCopiedOrderId] = useState(false);

  const handleCopyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    });
  };

  const displayOrderId = isCartCheckout ? orderResult?.orderId : orderResult?.orderId;

  return (
    <>
      {/* ====== ORDER SUCCESS OVERLAY POPUP ====== */}
      <AnimatePresence>
        {purchaseSuccess && (
          <framerMotion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0.85) 70%)' }}
          >
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <framerMotion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 10 + 4,
                    height: Math.random() * 10 + 4,
                    left: `${Math.random() * 100}%`,
                    background: ['#10b981','#6366f1','#f59e0b','#3b82f6','#ec4899'][i % 5],
                    opacity: 0.7,
                  }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{
                    y: ['0%', `${Math.random() * 60 + 20}vh`],
                    x: [`0px`, `${(Math.random() - 0.5) * 200}px`],
                    opacity: [0, 1, 0],
                    rotate: [0, Math.random() * 360],
                  }}
                  transition={{ duration: Math.random() * 2 + 1.5, delay: Math.random() * 0.8, ease: 'easeOut' }}
                />
              ))}
            </div>

            {/* Success Card */}
            <framerMotion.div
              initial={{ scale: 0.5, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -40 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              className="relative w-full max-w-md bg-slate-900/95 border border-green-500/30 rounded-3xl shadow-2xl shadow-green-500/10 overflow-hidden"
            >
              {/* Green glow top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-400" />

              <div className="p-8 flex flex-col items-center text-center">
                {/* Animated check icon */}
                <framerMotion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                  className="relative mb-5"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-600/20 border-2 border-green-500/40 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                  </div>
                  <framerMotion.div
                    className="absolute -top-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    <PartyPopper className="w-4 h-4 text-amber-900" />
                  </framerMotion.div>
                </framerMotion.div>

                {/* Title */}
                <framerMotion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl font-extrabold text-white mb-1"
                >
                  Order Successful! 🎉
                </framerMotion.h2>
                <framerMotion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-gray-400 text-sm mb-6"
                >
                  Your payment was processed. We'll get it to you soon!
                </framerMotion.p>

                {/* Order ID Card */}
                <framerMotion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-4 mb-5 space-y-3"
                >
                  {/* Order ID Row */}
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Order ID</div>
                        <div className="text-sm font-mono font-bold text-green-300">{displayOrderId || '—'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyOrderId(displayOrderId)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      title="Copy Order ID"
                    >
                      {copiedOrderId
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Items & Payment summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded-xl p-2.5 text-left">
                      <div className="text-gray-500 mb-0.5">Items</div>
                      <div className="text-white font-semibold truncate">
                        {purchasedItems.length === 1
                          ? `${purchasedItems[0]?.product?.name} (x${purchasedItems[0]?.quantity})`
                          : `${purchasedItems.length} products`}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-left">
                      <div className="text-gray-500 mb-0.5">Payment</div>
                      <div className="text-white font-semibold truncate">{finalPaymentMethod || paymentMethod}</div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-gray-400 text-sm">Total Paid</span>
                    <span className="text-green-400 font-extrabold text-xl">
                      ${finalTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </framerMotion.div>

                {/* Status badge */}
                <framerMotion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-6"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-300 text-xs font-semibold">Order Pending — Admin will update status</span>
                </framerMotion.div>

                {/* CTA Button */}
                <framerMotion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
                >
                  Continue Shopping
                </framerMotion.button>
              </div>
            </framerMotion.div>
          </framerMotion.div>
        )}
      </AnimatePresence>

      {/* ====== CHECKOUT MODAL ====== */}
      {!purchaseSuccess && (
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
            Express Checkout
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {(
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

            {/* PayPal Input Form */}
            {paymentMethod === 'PayPal' && (
              <framerMotion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 border-t border-white/10 pt-3 text-left"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-300 block">PayPal Checkout Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['PayPal Wallet', 'Credit/Debit Card', 'UPI / Smart Pay'].map((opt) => {
                      const isOptSelected = paypalOption === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPaypalOption(opt)}
                          className={`flex items-center justify-center py-1.5 px-1 rounded-lg border text-[10px] font-semibold transition-all ${
                            isOptSelected
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm shadow-blue-500/5'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {paypalOption === 'PayPal Wallet' && (
                  <framerMotion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1 pt-1.5"
                  >
                    <label className="text-[11px] font-semibold text-gray-300">PayPal Email or Mobile Number</label>
                    <input
                      type="text"
                      placeholder="paypal@example.com or +15551234567"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                      required
                    />
                    <p className="text-[10px] text-gray-500">You will be redirected securely to PayPal to authorize the transaction.</p>
                  </framerMotion.div>
                )}

                {paypalOption === 'Credit/Debit Card' && (
                  <framerMotion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pt-1.5"
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

                {paypalOption === 'UPI / Smart Pay' && (
                  <framerMotion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1 pt-1.5"
                  >
                    <label className="text-[11px] font-semibold text-gray-300">SmartPay UPI ID (via PayPal)</label>
                    <input
                      type="text"
                      placeholder="username@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                      required
                    />
                    <p className="text-[10px] text-gray-500">Accept the PayPal UPI payment request sent to your mobile wallet app.</p>
                  </framerMotion.div>
                )}
              </framerMotion.div>
            )}

            {/* SmartPay (UPI) Input Form */}
            {paymentMethod === 'SmartPay' && (
              <framerMotion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 border-t border-white/10 pt-3 text-left"
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">SmartPay UPI ID</label>
                  <input
                    type="text"
                    placeholder="username@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-blue-500 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none transition-colors text-xs"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-500">Accept the UPI payment request sent to your mobile wallet app to complete checkout.</p>
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
      )}
    </>
  );
};

export default PurchaseModal;
export { ProductImage };
