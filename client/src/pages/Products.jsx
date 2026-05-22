import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import ProductModal from '../components/ProductModal';
import PurchaseModal, { ProductImage } from '../components/PurchaseModal';
import CartDrawer from '../components/CartDrawer';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  ShoppingBag, 
  Star, 
  AlertTriangle, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

const Products = () => {
  const { user } = useContext(AuthContext);
  const { addToCart, cartCount } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  // Customer purchase modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [buyingProduct, setBuyingProduct] = useState(null);
  const [isCartCheckout, setIsCartCheckout] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSubmitProduct = async (formData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleBuyProduct = (product) => {
    setBuyingProduct(product);
    setIsCartCheckout(false);
    setPurchaseModalOpen(true);
  };

  const handleCartCheckout = () => {
    setCartDrawerOpen(false);
    setIsCartCheckout(true);
    setPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = (updatedProducts) => {
    if (!updatedProducts) return;
    
    // Refresh products list to update stock amounts for all purchased items
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const found = updatedProducts.find(up => up._id === p._id);
        return found ? found : p;
      });
    });
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gradient helper for category thumbnails
  const getCategoryGradient = (category) => {
    const cat = (category || 'default').toLowerCase();
    if (cat.includes('elect')) return 'from-blue-500 to-indigo-800';
    if (cat.includes('cloth') || cat.includes('fash') || cat.includes('apparel')) return 'from-purple-500 to-pink-800';
    if (cat.includes('home') || cat.includes('decor')) return 'from-emerald-500 to-teal-800';
    if (cat.includes('food') || cat.includes('bev')) return 'from-amber-500 to-red-800';
    return 'from-slate-600 to-slate-800';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page title and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              {user?.role === 'admin' ? 'Products Directory' : 'SmartStore Catalog'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {user?.role === 'admin'
                ? 'Manage inventory catalog levels, pricing strategies, and SEO meta keywords.'
                : 'Browse premium goods, check stock availability, and complete instant purchases.'}
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:scale-105"
            >
              <Plus size={20} /> Add Product
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={user?.role === 'admin' ? "Filter inventory catalog..." : "Search shop catalog..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/15 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="animate-pulse">Loading products database...</p>
          </div>
        ) : user?.role === 'admin' ? (
          /* ADMIN LAYOUT: Standard CRUD table */
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/40 text-gray-400 uppercase text-xs font-semibold">
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Stock</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{product.name}</td>
                      <td className="px-6 py-4 text-white">${product.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock === 0 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : product.stock < 10 
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{product.category}</td>
                      <td className="px-6 py-4 text-right space-x-3 pr-6">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-400 hover:text-blue-300 inline-flex p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-400 hover:text-red-300 inline-flex p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* CUSTOMER LAYOUT: Stunning E-commerce Storefront */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center flex flex-col items-center">
                <Layers className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-300 text-lg font-medium">No products match your search</p>
                <p className="text-gray-500 text-sm mt-1">Try refining your filter keyword.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock < 10;
                
                // Calculate discounted price
                const hasDiscount = (product.discount || 0) > 0;
                const salePrice = product.price * (1 - (product.discount || 0) / 100);

                return (
                  <motion.div
                    key={product._id}
                    variants={cardVariants}
                    whileHover={{ y: -5 }}
                    className="relative group backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col h-full"
                  >
                    {/* Glowing Accent Border */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/25 rounded-2xl pointer-events-none transition-colors"></div>

                    {/* Image Banner / Category Gradient Fallback */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                      {/* Image Banner with dynamic ease zoom */}
                      <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out">
                        <ProductImage src={product.image} alt={product.name} category={product.category} />
                      </div>

                      {/* Elegant subtle shadow bottom overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20"></div>
                      
                      {/* Category Label */}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/55 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-white/10">
                        {product.category || 'Curated'}
                      </span>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-red-400 shadow-md">
                          <Sparkles className="w-3 h-3" /> -{product.discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Title */}
                        <h3 className="text-base font-bold text-white leading-tight group-hover:text-blue-400 transition-colors truncate">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {product.description || 'Premium engineered item designed with absolute precision and certified retail grade components.'}
                        </p>

                        {/* Rating block */}
                        <div className="flex items-center gap-1 text-sm pt-1">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-gray-500 text-[10px] font-semibold ml-1">(12 reviews)</span>
                        </div>
                      </div>

                      {/* Price & Stock bar section */}
                      <div className="space-y-3 pt-1">
                        {/* Price display */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-extrabold text-xl">
                            ${salePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {hasDiscount && (
                            <span className="text-gray-500 line-through text-xs">
                              ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                        {/* Stock indicator & Stock progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">Inventory Available</span>
                            {isOutOfStock ? (
                              <span className="text-red-400 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Out of stock
                              </span>
                            ) : isLowStock ? (
                              <span className="text-yellow-400 font-bold flex items-center gap-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Only {product.stock} left!
                              </span>
                            ) : (
                              <span className="text-green-400 font-bold">In stock ({product.stock})</span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-white/5 border border-white/5 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOutOfStock 
                                  ? 'w-0' 
                                  : isLowStock 
                                  ? 'bg-gradient-to-r from-red-500 to-yellow-500' 
                                  : 'bg-gradient-to-r from-green-500 to-blue-500'
                              }`} 
                              style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Purchase trigger */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(product, 1)}
                          disabled={isOutOfStock}
                          className={`flex-1 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 group/btn shadow-md hover:shadow-lg ${
                            isOutOfStock
                              ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/10'
                          }`}
                        >
                          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                          {!isOutOfStock && <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />}
                        </button>
                        
                        {!isOutOfStock && (
                          <button
                            onClick={() => handleBuyProduct(product)}
                            className="px-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group/express"
                            title="Quick Checkout"
                          >
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/express:translate-x-0.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Shopping Cart Trigger */}
      {user?.role !== 'admin' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.5 }}
          onClick={() => setCartDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group border border-white/10"
        >
          <ShoppingBag className="w-6 h-6 group-hover:animate-bounce" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md animate-pulse">
              {cartCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Admin Product CRUD Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitProduct}
        initialData={editingProduct}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onCheckout={handleCartCheckout}
      />

      {/* Customer Shop Purchase Modal */}
      <AnimatePresence>
        {purchaseModalOpen && (
          <PurchaseModal
            isOpen={purchaseModalOpen}
            onClose={() => {
              setPurchaseModalOpen(false);
              setBuyingProduct(null);
              setIsCartCheckout(false);
            }}
            product={buyingProduct}
            isCartCheckout={isCartCheckout}
            onPurchaseSuccess={handlePurchaseSuccess}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Products;
