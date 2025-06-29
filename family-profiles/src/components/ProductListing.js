import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const ProductListing = ({ authToken }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartNotification, setCartNotification] = useState(null);

  useEffect(() => {
    fetchProfiles();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [activeProfile, selectedCategory, searchTerm, products]);

  useEffect(() => {
    if (cartNotification) {
      const timer = setTimeout(() => setCartNotification(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [cartNotification]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`${API_URL}/profiles`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      } else {
        setError('Failed to fetch profiles');
      }
    } catch (err) {
      setError('Error fetching profiles');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Profile-based filtering
    if (activeProfile) {
      filtered = filtered.filter(product => {
        // Gender filter
        if (product.gender !== 'Unisex' && product.gender !== activeProfile.gender) {
          return false;
        }
        
        // Size filter for clothing and footwear
        if ((product.category === 'clothing' || product.category === 'footwear') && product.sizes) {
          const preferredSize = product.category === 'clothing' 
            ? activeProfile.preferences.shirtSize 
            : activeProfile.preferences.shoeSize;
          if (preferredSize && !product.sizes.includes(preferredSize)) {
            return false;
          }
        }
        
        // Personal care brand preference
        if (product.category === 'personal-care' && activeProfile.preferences.personalCare) {
          if (product.brand && !activeProfile.preferences.personalCare.toLowerCase().includes(product.brand.toLowerCase())) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    setFilteredProducts(filtered);
  };

  const handleProfileSelect = (profile) => {
    setActiveProfile(profile);
  };

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (!res.ok) throw new Error('Failed to add to cart');
      setCartNotification({ type: 'success', message: 'Added to cart!' });
    } catch (err) {
      setCartNotification({ type: 'error', message: 'Failed to add to cart' });
    }
  };

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'footwear', name: 'Footwear', icon: '👟' },
    { id: 'personal-care', name: 'Personal Care', icon: '🧴' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b border-blue-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-white mr-4">
                ← Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Product Recommendations
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {activeProfile && (
                <div className="flex items-center bg-blue-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                  <span className="text-2xl mr-2">{activeProfile.avatar || activeProfile.name.charAt(0)}</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Shopping for {activeProfile.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-6 mt-6">
        {/* Profile Selection */}
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-md p-6 mb-8 mt-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Profile for Personalized Recommendations</h2>
          {profiles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No profiles found. Create your first profile to get personalized recommendations!
              </p>
              <Link 
                to="/profiles"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Profile
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile)}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all ${
                      activeProfile?.id === profile.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-blue-400'
                    }`}
                  >
                    <span className="text-2xl mr-2">{profile.avatar || profile.name.charAt(0)}</span>
                    <span className="font-medium">{profile.name}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({profile.ageGroup})</span>
                  </button>
                ))}
              </div>
              {/* Profile Preferences (internal, only when a profile is selected) */}
              {activeProfile && (
                <div className="rounded-xl shadow-inner p-4 mb-2 bg-blue-50 dark:bg-blue-900/30">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Profile Preferences</h3>
                  <div className="flex flex-wrap gap-6 text-gray-800 dark:text-gray-100">
                    <div><span className="font-medium">Name:</span> {activeProfile.name}</div>
                    <div><span className="font-medium">Age Group:</span> {activeProfile.ageGroup}</div>
                    <div><span className="font-medium">Gender:</span> {activeProfile.gender}</div>
                    <div><span className="font-medium">Shirt/Dress Size:</span> {activeProfile.preferences.shirtSize || '-'}</div>
                    <div><span className="font-medium">Shoe Size:</span> {activeProfile.preferences.shoeSize || '-'}</div>
                    <div><span className="font-medium">Personal Care:</span> {activeProfile.preferences.personalCare || '-'}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="w-full">
          {/* Search and Filters */}
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-md p-6 mb-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or brand..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Results Count */}
              <div className="flex items-end">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {filteredProducts.length} of {products.length} products
                  {activeProfile && ` for ${activeProfile.name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-6xl">
                      {product.category === 'clothing' && '👕'}
                      {product.category === 'footwear' && '👟'}
                      {product.category === 'personal-care' && '🧴'}
                    </span>
                  </div>
                  {activeProfile && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{product.brand}</p>
                  {product.sizes && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sizes: </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {!activeProfile && product.sizes.join(', ')}
                        {activeProfile && (['clothing', 'footwear'].includes(product.category)) && (() => {
                          const preferredSize = product.category === 'clothing'
                            ? activeProfile.preferences.shirtSize
                            : activeProfile.preferences.shoeSize;
                          return preferredSize && product.sizes.includes(preferredSize)
                            ? preferredSize
                            : null;
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'fill-gray-300 dark:fill-gray-700'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">
                        (4.5)
                      </span>
                    </div>
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>

      {cartNotification && (
        <div className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${cartNotification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {cartNotification.message}
        </div>
      )}
    </div>
  );
};

export default ProductListing; 