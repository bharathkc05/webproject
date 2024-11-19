const port = 4000;
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.2")
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Connection error:", error));

    const userSchema = new mongoose.Schema({
        name: String,
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        cartData: {
            type: Map,
            of: Number,
            default: {},
        },
        address: {
            type: String,
            default: '', // Optional: You can make this required if needed
        },
        date: {
            type: Date,
            default: Date.now,
        },
    });
    

const Users = mongoose.model("Users", userSchema);

// Hardcoded JWT Secret
const JWT_SECRET = "your_secret_key";  // Use your strong secret key here

// Signup Route
app.post('/signup', async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return res.status(400).json({ success: false, errors: "All fields are required." });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, errors: "Invalid email format." });
    }

    try {
        const check = await Users.findOne({ email });
        if (check) {
            return res.status(400).json({ success: false, errors: "User already exists. Please login." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Initialize the user with cartData as a Map
        const user = new Users({
            name,
            email,
            password: hashedPassword,
            cartData: new Map() // Initialize with an empty Map
        });

        // Initialize cartData with zero quantities for product IDs 1 to 30 (convert to string keys)
        for (let i = 1; i <= 30; i++) {
            user.cartData.set(i.toString(), 0); // Set the quantity to 0 for each product ID (as string key)
        }

        await user.save();

        const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET);  // Use the hardcoded JWT_SECRET
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error in /signup:", error);
        res.status(500).json({ success: false, errors: "Internal Server Error" });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, errors: "User doesn't exist. Please sign up." });
        }
        
        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(400).json({ success: false, errors: "Incorrect password." });
        }
  
        const token = jwt.sign({ user: { id: user.id } }, JWT_SECRET);  // Use the hardcoded JWT_SECRET
        res.json({ success: true, token });
    } catch (error) {
        console.error("Error in /login:", error);
        res.status(500).json({ success: false, errors: "Internal Server Error" });
    }
});

// Middleware to authenticate the token
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);  // Use the hardcoded JWT_SECRET
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

// Get Cart Route (Fetch cart data from backend)
app.get('/cart', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, errors: "User not found" });
        }
        
        res.json({ success: true, cartData: user.cartData });
    } catch (error) {
        console.error("Error in /cart:", error);
        res.status(500).json({ success: false, errors: "Internal Server Error" });
    }
});

// Update the cart
app.post('/update-cart', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.user.id;
      const { cartData } = req.body;
  
      // Ensure cartData is an object with productId-quantity pairs
      if (typeof cartData !== 'object' || cartData === null) {
        return res.status(400).json({ success: false, message: 'Invalid cart data format' });
      }
  
      // Find the user in the database
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Update each item in the cart by setting its quantity directly
      Object.entries(cartData).forEach(([productId, quantity]) => {
        // Convert productId to string as required by MongoDB's Map field
        const productIdStr = String(productId);
        
        // Ensure quantity is a valid number
        const validQuantity = Number(quantity);
        if (isNaN(validQuantity)) {
          console.log(`Invalid quantity for productId ${productIdStr}: ${quantity}`);
          return; // Skip invalid quantity
        }
  
        // Set the quantity in the cart data map
        user.cartData.set(productIdStr, validQuantity);
      });
  
      // Save the updated user cart data
      await user.save();
  
      // Return the updated cart data in the response
      return res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        cartData: Object.fromEntries(user.cartData), // Convert Map to object for the response
      });
  
    } catch (error) {
      // Handle JWT verification and other errors
      console.error('Error updating cart:', error);
      return res.status(500).json({ success: false, message: 'Failed to update the cart' });
    }
  });
  
// Get Profile Data Route
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ name: user.name, email: user.email, address: user.address });  // Include address here
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update Profile Route
app.post('/profile/update', authMiddleware, async (req, res) => {
    const { name, password, address } = req.body;

    try {
        const user = await Users.findById(req.user.id);  // Changed from User to Users
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (address) user.address = address;
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        
        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (error) {
        console.error("Error updating profile:", error);  // Log the error details
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
