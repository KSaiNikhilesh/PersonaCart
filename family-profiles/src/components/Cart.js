import React, { useEffect, useState } from 'react';

const Cart = ({ authToken }) => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [authToken]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/cart', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const cart = await res.json();
      setCartItems(cart);
      if (cart.length > 0) {
        // Fetch all products
        const prodRes = await fetch('http://localhost:4000/products', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!prodRes.ok) throw new Error('Failed to fetch products');
        const allProducts = await prodRes.json();
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await fetch(`http://localhost:4000/cart/${cartId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const getProduct = (productId) => products.find(p => p.id === cartItems.find(ci => ci.productId === productId)?.productId);

  const cartWithDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  const total = cartWithDetails.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div>Loading cart...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Cart</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {cartWithDetails.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300 py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">No items in cart</h2>
            <p>Add products to your cart to see them here.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 mb-6">
              {cartWithDetails.map(item => (
                <li key={item.id} className="flex items-center py-4">
                  {item.product.image && (
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{item.product.name}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">{item.product.brand}</div>
                    <div className="text-gray-700 dark:text-gray-200 text-sm">${item.product.price} x {item.quantity}</div>
                  </div>
                  <div className="font-bold text-green-600 dark:text-green-400 mr-4">${(item.product.price * item.quantity).toFixed(2)}</div>
                  <button onClick={() => handleRemove(item.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600">Remove</button>
                </li>
              ))}
            </ul>
            <div className="text-right text-xl font-bold text-gray-900 dark:text-white">
              Total: <span className="text-green-600 dark:text-green-400">${total.toFixed(2)}</span>
            </div>
            <div className="text-right mt-6">
              <button
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled
                title="Checkout is not implemented yet"
              >
                Buy Now
              </button>
              <div className="text-xs text-gray-500 mt-2">(Checkout not implemented yet)</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart; 