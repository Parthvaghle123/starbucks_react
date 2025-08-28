const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Product = require("./models/Product");
const app = express();
const SECRET_KEY = "your_secret_key";

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Connect MongoDB
mongoose.connect("mongodb://localhost:27017/Parth2")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

// Generate Unique 4 Digit Order ID
async function generateOrderId() {
  const year = new Date().getFullYear(); // Example: 2025

  const lastOrder = await Order.findOne({})
    .sort({ createdAt: -1 }) // લાસ્ટ ઓર્ડર લાવવો
    .limit(1);

  let nextSerial = 1; // First order

  if (lastOrder && lastOrder.orderId) {
    const lastId = parseInt(lastOrder.orderId);
    const lastYear = Math.floor(lastId / 1000); // Extract year from ID
    const lastSerial = lastId % 1000;

    if (lastYear === year) {
      nextSerial = lastSerial + 1;
    }
  }

  const paddedSerial = nextSerial.toString().padStart(3, "0"); // Example: "001"
  return `${year}${paddedSerial}`; // Example: "2025001"
}
// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};
app.get("/user/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ email: user.email, phone: user.phone });
  } catch (err) {
    res.status(500).json({ message: "Error getting profile" });
  }
});
// Verify Email Exists
app.post("/verify-email", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    return res.json({ exists: true });
  } else {
    return res.json({ exists: false });
  }
});

app.post("/change-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // ✅ Check password length minimum 8
    if (newPassword.length < 8) {
      return res.json({ message: "Password must be at least 8 characters" });
    }

    user.password = newPassword; // Optional: Hash it if needed
    await user.save();

    res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating password" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ✅ Password max length check
  if (password.length < 8) {
    return res.json({ message: "Password must be maximum 8 characters" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.json({ message: "No user found" });
  }

  if (user.password !== password) {
    return res.json({ message: "Password incorrect" });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: "7d",
  });

  res.json({ message: "Success", token, username: user.username });
});

// Logout: mark user as inactive
app.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'inactive';
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to logout', error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Password length check
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be maximum 8 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ ...req.body, email: email.toLowerCase() });
    res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
});

// Add to cart
app.post("/add-to-cart", authenticateToken, async (req, res) => {
  const { productId, image, title, price } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      return res.status(400).json({ message: "Item already in cart" });
    } else {
      cart.items.push({ productId, image, title, price, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// Get cart
app.get("/cart", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ cart: [] });

    const fullCart = cart.items.map(item => ({
      ...item._doc,
      total: item.price * item.quantity
    }));

    res.json({ cart: fullCart });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});app.put("/update-quantity/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    const item = cart.items.find((item) => item.productId === productId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (action === "increase") item.quantity += 1;
    if (action === "decrease") item.quantity -= 1;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    }

    await cart.save();
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from cart
app.delete("/remove-from-cart/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();
    res.status(200).json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place Order API
app.post("/order", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { email, phone, address, paymentMethod, cardNumber, expiry } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const user = await User.findById(userId);
    const newOrderId = await generateOrderId(); // Call unique ID function

    const order = new Order({
      orderId: newOrderId,
      username: user.username,
      email,
      phone,
      address,
      paymentMethod,
      payment_details: {
        cardNumber: paymentMethod === "Card" ? cardNumber : null,
        expiry: paymentMethod === "Card" ? expiry : null,
      },
      items: cart.items,
    });

    await order.save();
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(200).json({ message: "Order placed", orderId: newOrderId });
  } catch (err) {
    res.status(500).json({ message: "Order error", error: err.message });
  }
});

// Fetch orders
app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Cancel order
app.put("/api/cancel-order/:orderId", authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.email !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    order.status = "Cancelled";
    order.cancelReason = reason;
    order.items.forEach(item => item.status = "Cancelled");

    await order.save();
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Cancel error", error: err.message });
  }
});

// Admin credentials (for demo; use env vars/db in production)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// Admin login endpoint
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true, username }, SECRET_KEY, { expiresIn: '7d' });
    return res.json({ success: true, token });
  }
  res.json({ success: false, message: 'Invalid admin credentials' });
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Admin token required' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err || !user.admin) return res.status(403).json({ message: 'Invalid admin token' });
    req.admin = user;
    next();
  });
};

// Admin: Get all users
app.get("/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Admin: Get all orders
app.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Admin dashboard stats endpoint
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [totalUsers, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.find({}).sort({ createdAt: -1 }).limit(5)
    ]);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders: orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
});

~
// Admin: Delete user by ID
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    // Optionally, delete related data (orders, carts, etc.)
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
});

// ==================== PRODUCT MANAGEMENT APIs ====================

// Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, displayOnGift, displayOnMenu } = req.query;
    let filter = { isAvailable: true };
    
    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (displayOnGift === 'true') filter.displayOnGift = true;
    if (displayOnMenu === 'true') filter.displayOnMenu = true;
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// Admin: Get all products (with admin details)
app.get('/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// Admin: Create new product
app.post('/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product, message: 'Product created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
});

// Admin: Update product
app.put('/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
});

// Admin: Delete product
app.delete('/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
});

// Admin: Toggle product availability
app.patch('/admin/products/:id/toggle-availability', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    product.isAvailable = !product.isAvailable;
    await product.save();
    
    res.json({ 
      success: true, 
      product, 
      message: `Product ${product.isAvailable ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle product availability', error: err.message });
  }
});

// Admin: Toggle product display options
app.patch('/admin/products/:id/toggle-display', authenticateAdmin, async (req, res) => {
  try {
    const { displayType } = req.body; // 'gift' or 'menu'
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (displayType === 'gift') {
      product.displayOnGift = !product.displayOnGift;
    } else if (displayType === 'menu') {
      product.displayOnMenu = !product.displayOnMenu;
    }
    
    await product.save();
    
    res.json({ 
      success: true, 
      product, 
      message: `Product display on ${displayType} ${product[displayType === 'gift' ? 'displayOnGift' : 'displayOnMenu'] ? 'enabled' : 'disabled'}` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle product display', error: err.message });
  }
});

// Start server
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});