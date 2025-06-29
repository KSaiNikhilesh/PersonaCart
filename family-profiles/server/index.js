const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

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

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

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

// Create tables and seed sample data if empty
function initializeDatabase() {
  db.serialize(() => {
    // Create profiles table (no seeding - users create their own profiles)
    db.run(`CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      userId TEXT,
      name TEXT,
      ageGroup TEXT,
      gender TEXT,
      avatar TEXT,
      preferences TEXT
    )`);
    
    // Create products table with sample data
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      price REAL,
      sizes TEXT,
      gender TEXT,
      brand TEXT
    )`);
    
    // Create cart table (user-specific)
    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id TEXT PRIMARY KEY,
      userId TEXT,
      productId TEXT,
      quantity INTEGER
    )`);
    
    // Seed only products (no profiles or users)
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (row.count === 0) {
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
          db.run('INSERT INTO products (id, name, category, price, sizes, gender, brand) VALUES (?, ?, ?, ?, ?, ?, ?)', p);
        }
        console.log('Sample products seeded successfully');
      }
    });
  });
}

initializeDatabase();

// List all profiles for the user (user-specific data)
app.get('/profiles', authenticateToken, (req, res) => {
  const userId = req.user.uid; // Each user only sees their own profiles
  db.all('SELECT * FROM profiles WHERE userId = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    // Parse preferences JSON
    rows.forEach(r => r.preferences = JSON.parse(r.preferences));
    res.json(rows);
  });
});

// Get a single profile by ID (user-specific)
app.get('/profiles/:id', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  db.get('SELECT * FROM profiles WHERE userId = ? AND id = ?', [userId, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!row) return res.status(404).json({ message: 'Profile not found' });
    row.preferences = JSON.parse(row.preferences);
    res.json(row);
  });
});

// Create a new profile (user-specific)
app.post('/profiles', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  const id = String(Date.now());
  const { name, ageGroup, gender, avatar, preferences } = req.body;
  db.run('INSERT INTO profiles (id, userId, name, ageGroup, gender, avatar, preferences) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, name, ageGroup, gender, avatar, JSON.stringify(preferences)],
    function(err) {
      if (err) return res.status(500).json({ message: 'DB error' });
      db.get('SELECT * FROM profiles WHERE id = ?', [id], (err, row) => {
        if (row) row.preferences = JSON.parse(row.preferences);
        res.status(201).json(row);
      });
    });
});

// Update a profile (user-specific)
app.put('/profiles/:id', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  const { name, ageGroup, gender, avatar, preferences } = req.body;
  db.run('UPDATE profiles SET name = ?, ageGroup = ?, gender = ?, avatar = ?, preferences = ? WHERE userId = ? AND id = ?',
    [name, ageGroup, gender, avatar, JSON.stringify(preferences), userId, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ message: 'DB error' });
      db.get('SELECT * FROM profiles WHERE id = ?', [req.params.id], (err, row) => {
        if (row) row.preferences = JSON.parse(row.preferences);
        res.json(row);
      });
    });
});

// Delete a profile (user-specific)
app.delete('/profiles/:id', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  db.get('SELECT * FROM profiles WHERE userId = ? AND id = ?', [userId, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!row) return res.status(404).json({ message: 'Profile not found' });
    db.run('DELETE FROM profiles WHERE userId = ? AND id = ?', [userId, req.params.id], function(err) {
      if (err) return res.status(500).json({ message: 'DB error' });
      row.preferences = JSON.parse(row.preferences);
      res.json({ success: true, deleted: row });
    });
  });
});

// Get products personalized for a profile (user-specific profile access)
app.get('/products', authenticateToken, (req, res) => {
  const { profile_id } = req.query;
  const userId = req.user.uid;
  
  if (!profile_id) {
    // If no profile_id, return all products
    db.all('SELECT * FROM products', [], (err, products) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      // Parse sizes for each product
      products.forEach(p => { if (p.sizes) p.sizes = JSON.parse(p.sizes); });
      res.json(products);
    });
    return;
  }
  
  // Verify the profile belongs to the user
  db.get('SELECT * FROM profiles WHERE userId = ? AND id = ?', [userId, profile_id], (err, profile) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const preferences = JSON.parse(profile.preferences);
    db.all('SELECT * FROM products', [], (err, products) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      // Filter logic: gender, size, personal care
      const filtered = products.filter(product => {
        if (product.gender !== 'Unisex' && product.gender !== profile.gender) return false;
        if (product.category === 'clothing' && preferences.shirtSize && product.sizes && !JSON.parse(product.sizes).includes(preferences.shirtSize)) return false;
        if (product.category === 'footwear' && preferences.shoeSize && product.sizes && !JSON.parse(product.sizes).includes(preferences.shoeSize)) return false;
        if (product.category === 'personal-care' && preferences.personalCare && product.brand && !preferences.personalCare.toLowerCase().includes(product.brand.toLowerCase())) return false;
        return true;
      });
      // Parse sizes for each product
      filtered.forEach(p => { if (p.sizes) p.sizes = JSON.parse(p.sizes); });
      res.json(filtered);
    });
  });
});

// --- CART ENDPOINTS ---
// Get all cart items for the user
app.get('/cart', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  db.all('SELECT * FROM cart WHERE userId = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(rows);
  });
});

// Add a product to the cart (or update quantity if already exists)
app.post('/cart', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  const { productId, quantity } = req.body;
  if (!productId || !quantity) return res.status(400).json({ message: 'Product and quantity required' });
  db.get('SELECT * FROM cart WHERE userId = ? AND productId = ?', [userId, productId], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (row) {
      // Update quantity
      db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, row.id], function(err) {
        if (err) return res.status(500).json({ message: 'DB error' });
        db.get('SELECT * FROM cart WHERE id = ?', [row.id], (err, updatedRow) => {
          res.json(updatedRow);
        });
      });
    } else {
      const id = String(Date.now());
      db.run('INSERT INTO cart (id, userId, productId, quantity) VALUES (?, ?, ?, ?)', [id, userId, productId, quantity], function(err) {
        if (err) return res.status(500).json({ message: 'DB error' });
        db.get('SELECT * FROM cart WHERE id = ?', [id], (err, newRow) => {
          res.status(201).json(newRow);
        });
      });
    }
  });
});

// Remove a product from the cart by cart item id
app.delete('/cart/:id', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  db.run('DELETE FROM cart WHERE userId = ? AND id = ?', [userId, req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ success: true });
  });
});

// Clear the cart for the user
app.delete('/cart', authenticateToken, (req, res) => {
  const userId = req.user.uid;
  db.run('DELETE FROM cart WHERE userId = ?', [userId], function(err) {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json({ success: true });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Firebase authentication enabled');
  console.log('User data isolation: Each user only sees their own profiles');
}); 