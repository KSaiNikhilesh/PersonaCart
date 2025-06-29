const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = 4000;

// Initialize Firebase Admin SDK using environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware to verify Firebase token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// --- Initialize Database Tables and Seed Data ---
async function initializeDatabase() {
  // Create tables
  await pool.query(`CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    ageGroup TEXT,
    gender TEXT,
    avatar TEXT,
    preferences TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL,
    sizes TEXT,
    gender TEXT,
    brand TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cart (
    id TEXT PRIMARY KEY,
    userId TEXT,
    productId TEXT,
    quantity INTEGER
  )`);
  // Seed products if empty
  const { rows } = await pool.query('SELECT COUNT(*) as count FROM products');
  if (parseInt(rows[0].count) === 0) {
    const productData = [
      ['p1', "Men's Cotton T-Shirt", 'clothing', 24.99, JSON.stringify(['S','M','L','XL']), 'Male', 'Generic Brand'],
      ['p2', "Women's Blouse", 'clothing', 39.99, JSON.stringify(['XS','S','M','L']), 'Female', 'Fashion Brand'],
      ['p3', 'Kids Summer Dress', 'clothing', 19.99, JSON.stringify(['2T','3T','4T','5T']), 'Female', 'Kids Fashion'],
      ['p4', "Men's Running Shoes", 'footwear', 79.99, JSON.stringify(['8','9','10','11','12']), 'Male', 'Sports Brand'],
      ['p5', "Women's Sandals", 'footwear', 34.99, JSON.stringify(['6','7','8','9']), 'Female', 'Summer Style'],
      ['p6', 'Kids Sneakers', 'footwear', 29.99, JSON.stringify(['1','2','3','4']), 'Unisex', 'Kids Comfort'],
      ['p7', 'Dove Men+Care Body Wash', 'personal-care', 8.99, null, 'Male', 'Dove'],
      ['p8', "Nivea Women's Body Lotion", 'personal-care', 12.99, null, 'Female', 'Nivea'],
      ['p9', 'Johnson & Johnson Baby Shampoo', 'personal-care', 6.99, null, 'Unisex', 'Johnson & Johnson'],
      ['p10', 'Head & Shoulders Anti-Dandruff', 'personal-care', 9.99, null, 'Unisex', 'Head & Shoulders'],
      ['p11', 'Pantene Pro-V Shampoo', 'personal-care', 11.99, null, 'Female', 'Pantene'],
      ['p12', 'Old Spice Deodorant', 'personal-care', 7.99, null, 'Male', 'Old Spice']
    ];
    for (const p of productData) {
      await pool.query('INSERT INTO products (id, name, category, price, sizes, gender, brand) VALUES ($1, $2, $3, $4, $5, $6, $7)', p);
    }
    console.log('Sample products seeded successfully');
  }
}

initializeDatabase();

// List all profiles for the user
app.get('/profiles', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE userId = $1', [userId]);
    rows.forEach(r => r.preferences = JSON.parse(r.preferences));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Get a single profile by ID
app.get('/profiles/:id', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE userId = $1 AND id = $2', [userId, req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Profile not found' });
    rows[0].preferences = JSON.parse(rows[0].preferences);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Create a new profile
app.post('/profiles', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  const id = String(Date.now());
  const { name, ageGroup, gender, avatar, preferences } = req.body;
  try {
    await pool.query('INSERT INTO profiles (id, userId, name, ageGroup, gender, avatar, preferences) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, name, ageGroup, gender, avatar, JSON.stringify(preferences)]);
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [id]);
    if (rows[0]) rows[0].preferences = JSON.parse(rows[0].preferences);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Update a profile
app.put('/profiles/:id', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  const { name, ageGroup, gender, avatar, preferences } = req.body;
  try {
    await pool.query('UPDATE profiles SET name = $1, ageGroup = $2, gender = $3, avatar = $4, preferences = $5 WHERE userId = $6 AND id = $7',
      [name, ageGroup, gender, avatar, JSON.stringify(preferences), userId, req.params.id]);
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.params.id]);
    if (rows[0]) rows[0].preferences = JSON.parse(rows[0].preferences);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Delete a profile
app.delete('/profiles/:id', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    const { rows } = await pool.query('SELECT * FROM profiles WHERE userId = $1 AND id = $2', [userId, req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Profile not found' });
    await pool.query('DELETE FROM profiles WHERE userId = $1 AND id = $2', [userId, req.params.id]);
    rows[0].preferences = JSON.parse(rows[0].preferences);
    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Get products personalized for a profile
app.get('/products', authenticateToken, async (req, res) => {
  const { profile_id } = req.query;
  const userId = req.user.uid;
  try {
    if (!profile_id) {
      const { rows } = await pool.query('SELECT * FROM products');
      rows.forEach(p => { if (p.sizes) p.sizes = JSON.parse(p.sizes); });
      return res.json(rows);
    }
    const { rows: profileRows } = await pool.query('SELECT * FROM profiles WHERE userId = $1 AND id = $2', [userId, profile_id]);
    if (!profileRows[0]) return res.status(404).json({ message: 'Profile not found' });
    const preferences = JSON.parse(profileRows[0].preferences);
    const { rows: products } = await pool.query('SELECT * FROM products');
    const filtered = products.filter(product => {
      if (product.gender !== 'Unisex' && product.gender !== profileRows[0].gender) return false;
      if (product.category === 'clothing' && preferences.shirtSize && product.sizes && !JSON.parse(product.sizes).includes(preferences.shirtSize)) return false;
      if (product.category === 'footwear' && preferences.shoeSize && product.sizes && !JSON.parse(product.sizes).includes(preferences.shoeSize)) return false;
      if (product.category === 'personal-care' && preferences.personalCare && product.brand && !preferences.personalCare.toLowerCase().includes(product.brand.toLowerCase())) return false;
      return true;
    });
    filtered.forEach(p => { if (p.sizes) p.sizes = JSON.parse(p.sizes); });
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// --- CART ENDPOINTS ---
// Get all cart items for the user
app.get('/cart', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  // console.log('Fetching cart for user:', userId);
  try {
    const { rows } = await pool.query('SELECT * FROM cart WHERE userId = $1', [userId]);
    // console.log('Cart rows:', rows);
    // Map keys to camelCase for frontend compatibility
    const mappedRows = rows.map(row => ({
      id: row.id,
      userId: row.userid,
      productId: row.productid,
      quantity: row.quantity
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

// Add a product to the cart (or update quantity if already exists)
app.post('/cart', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  const { productId, quantity } = req.body;
  if (!productId || !quantity) return res.status(400).json({ message: 'Product and quantity required' });
  try {
    const { rows } = await pool.query('SELECT * FROM cart WHERE userId = $1 AND productId = $2', [userId, productId]);
    if (rows[0]) {
      await pool.query('UPDATE cart SET quantity = quantity + $1 WHERE id = $2', [quantity, rows[0].id]);
      const { rows: updatedRows } = await pool.query('SELECT * FROM cart WHERE id = $1', [rows[0].id]);
      res.json(updatedRows[0]);
    } else {
      const id = String(Date.now());
      await pool.query('INSERT INTO cart (id, userId, productId, quantity) VALUES ($1, $2, $3, $4)', [id, userId, productId, quantity]);
      const { rows: newRows } = await pool.query('SELECT * FROM cart WHERE id = $1', [id]);
      res.status(201).json(newRows[0]);
    }
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Remove a product from the cart by cart item id
app.delete('/cart/:id', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    await pool.query('DELETE FROM cart WHERE userId = $1 AND id = $2', [userId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Clear the cart for the user
app.delete('/cart', authenticateToken, async (req, res) => {
  const userId = req.user.uid;
  try {
    await pool.query('DELETE FROM cart WHERE userId = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'DB error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Firebase authentication enabled');
  console.log('User data isolation: Each user only sees their own profiles');
}); 