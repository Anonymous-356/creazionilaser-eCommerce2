import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCartItemSchema, 
  insertDesignSchema, 
  categories,
  subcategories, 
  products, 
  users, 
  artists,
  wishlist,
  quotes,
  enquiries,
  settings 
} from "@shared/schema";
import { db,pool } from "./db";
import { sql, eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { v4 as uuidv4 } from 'uuid'

// Configure multer for file uploads
const upload = multer({
  dest: './uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false, // Don't recreate table/index
    tableName: 'sessions',
  });
  
  // Suppress error logging for existing index
  const originalLog = console.error;
  console.error = (...args) => {
    if (args[0]?.message?.includes('IDX_session_expire') || 
        args[0]?.toString?.()?.includes('IDX_session_expire')) {
      return; // Ignore this specific error
    }
    originalLog.apply(console, args);
  };
  
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'connect.sid'
  }));

  // Seed data on startup
  await seedData();

  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (first user becomes admin)
      const userCount = await db.select({ count: sql`count(*)` }).from(users);
      const isFirstUser = (userCount[0]?.count || 0) === 0;
      const currentDate = new Date();
      
      const user = await storage.createUser({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        userType: isFirstUser ? 'admin' : 'customer',
        createdAt: currentDate,
      });

      // Auto-login the user after successful signup
      (req.session as any).userId = user.id;
      console.log("Signup - Set session userId:", user.id);
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        } else {
          console.log("Session saved successfully");
        }
      });
      
      // Return user data (without password) and success message
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        message: isFirstUser ? "Admin account created successfully" : "User created successfully", 
        ...userWithoutPassword 
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Blocked user
      if (user && user.isBlocked === 1) {
        return res.status(400).json({ message: "Blocked user,please contact your administrator." });
      }

      const artist = await storage.getArtistByUserId(user.id);
      if(artist)
        (req.session as any).artistId = artist.id;

      // Set session
      (req.session as any).userId = user.id;

      console.log("Login - Set session userId:", user.id);
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
        } else {
          console.log("Session saved successfully");
        }
      });
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
     
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // End Authentication routes


  // Custom Quotes 
  app.post('/api/quotes',upload.single('attachment'), async (req: any, res) => {

    try {
        
        console.log(req.body);
        const userId = req.session.userId;
        const currentDate = new Date();

        const quoteData = {
          userId : userId || "",
          title: req.body.title,
          email: req.body.email,
          subject: req.body.subject,
          description: req.body.description,
          attachment: req.file ? `/uploads/${req.file.filename}` : null,
          createdAt : currentDate,
        };

      const quote = await storage.submitQuote(quoteData);
      res.status(201).json(quote);
    } catch (error) {
      console.error("Error submitting custom quote:", error);
      res.status(500).json({ message: "Failed to submit custom quote" });
    }
  });

  // Custom Quotes 
  app.post('/api/enquiries',upload.single('attachment'), async (req: any, res) => {

    try {
        
        const userId = req.session.userId;
        const currentDate = new Date();

        const enquiryData = {
          userId : userId || "",
          title: req.body.title,
          email: req.body.email,
          subject: req.body.subject,
          message: req.body.message,
          createdAt : currentDate,
        };

      const quote = await storage.submitEnquiry(enquiryData);
      res.status(201).json(quote);
    } catch (error) {
      console.error("Error submitting custom quote:", error);
      res.status(500).json({ message: "Failed to submit custom quote" });
    }
  });

   // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category) {
        const categoryData = await storage.getCategoryBySlug(category as string);
        if (!categoryData) {
          return res.status(404).json({ message: "Category not found" });
        }
        products = await storage.getProductsByCategory(categoryData.id);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Artist routes
  app.get('/api/artists', async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get('/api/artist/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(id);
      const artist = await storage.getArtist(id);
      console.log(artist);
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  app.get('/api/artists/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const artist = await storage.getArtistByUserId(userId);
      
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  app.post('/api/artists', isAuthenticated,upload.single('image'), async (req: any, res) => {
    
    try {
      
      const currentDate = new Date();
      const userId = req.session.userId;
      
      const artistData = {
        userId,
        bio: req.body.bio,
        specialty: req.body.specialty,
        socialLinks: {
          website: req.body.website,
          instagram: req.body.instagram,
        },
        portfolio : req.file ? `/uploads/${req.file.filename}` : null,
        createdAt : currentDate,
      };
      
      const artist = await storage.createArtist(artistData);
      
      const userType = "artist";
      const [user] = await db.update(users)
        .set({ userType : userType,})
        .where(eq(users.id, userId))
        .returning();

      res.status(201).json(artist);

    } catch (error) {
      console.error("Error creating artist:", error);
      res.status(500).json({ message: "Failed to create artist profile" });
    }
  });

  app.put("/api/artists/:id/", isAuthenticated,upload.single('image'), async (req, res) => {

    try {

      const currentDate = new Date();
      const artistId = parseInt(req.params.id);
      const userId = parseInt(req.body.userId);

      const [artist] = await db.update(artists)
        .set({
          bio: req.body.bio,
          specialty: req.body.specialty,
          socialLinks: {
            website: req.body.website,
            instagram: req.body.instagram,
          },
          updatedAt : currentDate,
        })
        .where(eq(artists.id, artistId))
        .returning();
     
      const [user] = await db.update(users)
      .set({
        firstName : req.body.firstName,
        lastName : req.body.firstName,
        email : req.body.email,
        profileImageUrl : req.file ? `/uploads/${req.file.filename}` : req.body.existingProfileImage,
        updatedAt : currentDate,
      })
      .where(eq(users.id , userId))  
      .returning();

      console.log("Updated artist profile successfully:");
      res.json({ message: "Updated artist profile successfully", artist });
    } catch (error) {
      console.error("Failed to update artist:", error);
      res.status(500).json({ message: "Failed to udpate artist." });
    }

  });

  app.get('/api/users/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/users/:id/", isAuthenticated,upload.single('image'), async (req, res) => {

    try {

      console.log('Functioning...');

      const currentDate = new Date();
      const userId = parseInt(req.params.id);

      const [user] = await db.update(users)
      .set({
        firstName : req.body.firstName,
        lastName : req.body.firstName,
        email : req.body.email,
        profileImageUrl : req.file ? `/uploads/${req.file.filename}` : req.body.existingProfileImage,
        updatedAt : currentDate,
      })
      .where(eq(users.id , userId))  
      .returning();

      console.log("Updated user profile successfully:");
      res.json({ message: "Updated user profile successfully", user });
    } catch (error) {
      console.log('Not Functioning...');
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to udpate user." });
    }

  });

  // Design routes
  app.get('/api/designs', async (req, res) => {

    try {
      const { artist } = req.query;
      let designs;
      if (artist) {
        designs = await storage.getDesignsByArtist(parseInt(artist as string));
      } else {
        designs = await storage.getAllDesigns();
      }
      res.json(designs);
    } catch (error) {
      console.error("Error fetching designs:", error);
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  app.get('/api/designs/:id', async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const design = await storage.getDesign(designId);
      
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      
      res.json(design);
    } catch (error) {
      console.error("Error fetching design:", error);
      res.status(500).json({ message: "Failed to fetch design" });
    }
  });

  app.post('/api/designs', isAuthenticated, upload.single('image'), async (req: any, res) => {
    
    try {

      const userId = req.session.userId;
      
      // Either get existing or create new artist profile.
      let artist = await storage.getArtistByUserId(userId);
      if (!artist) {
        artist = await storage.createArtist({
          userId,
          bio: "New artist",
          specialty: "General",
          isVerified: false,
          commissionRate: "0.30",
        });
      }

      const designData = {
        artistId: artist?.artistId,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const design = await storage.createDesign(designData);
      res.status(201).json(design);
    } catch (error) {
      console.error("Error creating design:", error);
      res.status(500).json({ message: "Failed to create design" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {

    console.log('Hello functioning....');
    
     try {

      const [listItem] = await db.insert(wishlist).values({
        designId: req.body.designID,
        userId : req.body.userID,
      })
      .returning();

      res.status(201).json(wishlist);
    } catch (error) {
      console.error("Error adding design to wishlist:", error);
      res.status(500).json({ message: "Failed to add design to wishlist" });
    }

  });

  // Cart routes (authenticated)
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const cartData = { ...req.body, userId };
      const item = await storage.addToCart(cartData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const { quantity } = req.body;
      await storage.updateCartItem(itemId, quantity);
      res.json({ message: "Cart item updated" });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      await storage.removeFromCart(itemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order/Checkout routes (authenticated)
  app.post('/api/orders', async (req, res) => {
    try {

      const userId = parseInt(req.session.id);
      const newOrderId = uuidv4(); // Generate a UUID v4
      const currentDate = new Date();
      
      const orderData = {
        userId : userId,
        orderNumber :newOrderId,
        totalAmount : req.body.totalAmount,
        shippingAddress : req.body.shippingAddress,
        notes : req.body.notes,
        createdAt : currentDate,
        updatedAt : currentDate,
      };

      const items = {
        userId : userId,
        orderId :12,
        productId : req.body.cartItems.productId,
        designId : req.body.cartItems.designId,
        quantity : req.body.cartItems.quantity,
        unitPrice : req.body.cartItems.price,
        customization : req.body.cartItems.customization,
      };

      const order = await storage.createOrder(orderData , items);

      // For now return empty array since orders table might not have data
      res.json(order);
    } catch (error) {
      console.error("Error placing new order:", error);
      res.status(500).json({ message: "Failed to place new orders" });
    }
  });
  
  // Admin routes (protected)
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user || (user as any).userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      req.user = user; // Add user to request object
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      return res.status(500).json({ message: "Authentication error" });
    }
  };

  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
      const totalProducts = await db.select({ count: sql`count(*)` }).from(products);
      const totalCategories = await db.select({ count: sql`count(*)` }).from(categories);
      
      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        totalProducts: totalProducts[0]?.count || 0,
        totalCategories: totalCategories[0]?.count || 0,
        totalDesigns: 0, // Will implement when designs table exists
        totalArtists: 0,
        totalOrders: 0,
        totalRevenue: 0,
        newUsersThisWeek: 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        userType: users.userType,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.isBlocked, 0));
      
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAdmin, async (req, res) => {
    try {
    
      const {fname, lname, email,password,} = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const currentDate = new Date();

      const [user] = await db.insert(users).values({
        firstName :fname,
        lastName : lname || null,
        email ,
        password: hashedPassword,      
        createdAt: currentDate, 
      }).returning();

      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating new user:", error);
      res.status(500).json({ message: "Failed to create new user." });
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {

      const userId = parseInt(req.params.id);
      const {fname,lname,email,currentEmail} = req.body;
      const currentDate = new Date();

      // Check if user already exists
      if(currentEmail !== email){
          const existingUser = await storage.getUserByEmail(email);
          if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
          }
      }

      await db.update(users)
        .set({
          firstName :fname,
          lastName : lname || null,
          email ,
          updatedAt : currentDate,
        })
        .where(eq(users.id, userId))
      
      console.log("Successfully updated user");
      res.json({ message: "Successfully updated user", userId });

    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.put("/api/admin/users/:id/:isBlock", isAdmin, async (req, res) => {
    try {
      
      const currentDate = new Date();
      const userId = parseInt(req.params.id);
      const isBlock = parseInt(req.params.isBlock);
      
      await db.update(users)
        .set({isBlocked :isBlock,updatedAt : currentDate,})
        .where(eq(users.id, userId))
      
      console.log("Successfully blocked user");
      res.json({ message: "Successfully blocked user", userId });

    } catch (error) {
      console.error("Failed to blocked user:", error);
      res.status(500).json({ message: "Failed to blocked user" });
    }
  });

  app.get('/api/admin/artists',isAdmin, async (req, res) => {
    try {

      const allArtists = await db.select({
        id: users.id,
        artistId : artists.id,
        specialty : artists.specialty,
        biography : artists.bio,
        isVerified : artists.isVerified,
        isBlocked : artists.isBlocked,
        socialLinks : artists.socialLinks,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        imageUrl : users.profileImageUrl,
        userType: users.userType,
        createdAt: artists.createdAt,
      }).from(artists).leftJoin(users, eq(artists.userId , users.id)).where(eq(artists.isBlocked,0));
      
      res.json(allArtists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.put("/api/admin/artists/:id", isAdmin, async (req, res) => {

    try {


      const userId = parseInt(req.params.id);
      const {specialty,biography} = req.body;
      const currentDate = new Date();

       const query = await db.update(artists)
        .set({
          specialty,
          bio : biography,
          createdAt : currentDate,
        })
        .where(eq(artists.id, userId))
        .toSQL();
      
      console.log("Successfully updated artist",query);
      res.json({ message: "Successfully updated artist", userId });

    } catch (error) {
      console.error("Failed to update artist:", error);
      res.status(500).json({ message: "Failed to update artist." });
    }
  });

  app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
      const allProducts = await db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        basePrice: products.basePrice,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        categoryName: categories.name,
        imageUrl: categories.imageUrl,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));
      
      // Disable caching to ensure fresh data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/admin/products', isAdmin, async (req, res) => {
    try {
      const { name, description, categoryId,subcategoryId, basePrice, imageUrl, customizationOptions } = req.body;
      
      if (!name || !categoryId || !basePrice) {
        return res.status(400).json({ message: "Name, category, and price are required" });
      }
      
      const [product] = await db.insert(products).values({
        name,
        description: description || null,
        categoryId: parseInt(categoryId),
        subcategoryId: parseInt(subcategoryId),
        basePrice,
        imageUrl: imageUrl || null,
        customizationOptions,
      }).returning();

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product
  app.put("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { name, description, categoryId,subcategoryId, basePrice, imageUrl } = req.body;
      
      if (!name || !categoryId || !basePrice) {
        return res.status(400).json({ message: "Name, category, and price are required" });
      }

      const [product] = await db.update(products)
        .set({
          name,
          description: description || null,
          categoryId: parseInt(categoryId),
          subcategoryId : parseInt(subcategoryId),
          basePrice,
          imageUrl: imageUrl || null,
        })
        .where(eq(products.id, productId))
        .returning();

      res.json(product);
    } catch (error) {
      console.error("Failed to update product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      console.log("Attempting to delete product with ID:", productId);
      
      const result = await db.delete(products).where(eq(products.id, productId));
      console.log("Delete result:", result);
      
      res.json({ message: "Product deleted successfully", productId });
    } catch (error) {
      console.error("Failed to delete product:", error);
      res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
  });

  app.get('/api/admin/categories', isAdmin, async (req, res) => {
    try {
      
      const allCategories = await db.select().from(categories).orderBy(categories.id);
      
      console.log("Fetched categories:", allCategories.length);
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Category CRUD operations
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      
      const { name, description, slug, imageUrl, sortOrder } = req.body;
      console.log("Creating category with data:", {name, description, slug ,imageUrl, sortOrder});
      
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const [category] = await db.insert(categories).values({
        name,
        description: description || null,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        imageUrl : imageUrl || null,
        sortOrder,
      }).returning();
      
      console.log("Created category:", category);
      res.json(category);
    } catch (error) {
      console.error("Failed to create category:", error);
      res.status(500).json({ message: "Failed to create category", error: error.message });
    }
  });

  // Update category
  app.put("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, slug, imageUrl, sortOrder } = req.body;
      console.log("Updating category:", categoryId, { name, description, slug ,imageUrl, sortOrder});
      
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const [category] = await db.update(categories)
        .set({
          name,
          description: description || null,
          slug: slug,
          imageUrl : imageUrl || null,
          sortOrder,
        })
        .where(eq(categories.id, categoryId))
        .returning();
      
      console.log("Updated category:", category);
      res.json(category);
    } catch (error) {
      console.error("Failed to update category:", error);
      res.status(500).json({ message: "Failed to update category", error: error.message });
    }
  });

  // Delete category (with cascade check)
  app.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      console.log("Attempting to delete category with ID:", categoryId);
      
      // Check if there are products using this category
      const productsInCategory = await db.select().from(products).where(eq(products.categoryId, categoryId));
      console.log("Products in category:", productsInCategory.length);
      
      if (productsInCategory.length > 0) {
        return res.status(400).json({ 
          message: `Cannot delete category. ${productsInCategory.length} product(s) are using this category. Please delete or reassign the products first.`,
          productsCount: productsInCategory.length
        });
      }
      
      const result = await db.delete(categories).where(eq(categories.id, categoryId));
      console.log("Delete category result:", result);
      
      res.json({ message: "Category deleted successfully", categoryId, result });
    } catch (error) {
      console.error("Failed to delete category:", error);
      res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
  });

  // Get Sub Categories
  app.get('/api/admin/subcategories', isAdmin, async (req, res) => {
    try {
      
      const allCategories = await db.select().from(subcategories).orderBy(subcategories.id);
      
      console.log("Fetched subcategories:", allCategories.length);
      res.json(allCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Sub Category CRUD operations
  app.post("/api/admin/subcategories", isAdmin, async (req, res) => {
    try {
          
      console.log(req.body);

      const { categoryId, name, description, slug, imageUrl, sortOrder } = req.body;
      console.log("Creating subcategories with data:", { name, description, slug ,imageUrl, sortOrder});
      
      if (!name) {
        return res.status(400).json({ message: "Category name is required" });
      }

      const [subcategory] = await db.insert(subcategories).values({
        categoryId,
        name,
        description: description || null,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        imageUrl : imageUrl || null,
        sortOrder,
      }).returning();
      
      console.log("Created subcategories:", subcategory);
      res.json(subcategory);
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      res.status(500).json({ message: "Failed to create subcategory", error: error.message });
    }
  });

  // Update Subcategory
  app.put("/api/admin/subcategories/:id", isAdmin, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      const {categoryId, name, description, slug, imageUrl, sortOrder } = req.body;
      console.log("Updating subcategories:", subcategoryId, { name, description, slug ,imageUrl, sortOrder});
      
      if (!name) {
        return res.status(400).json({ message: "Sub Category name is required" });
      }

      const [subcategory] = await db.update(subcategories)
        .set({
          categoryId,
          name,
          description: description || null,
          slug: slug,
          imageUrl : imageUrl || null,
          sortOrder,
        })
        .where(eq(subcategories.id, subcategoryId))
        .returning();
      
      console.log("Updated category:", subcategory);
      res.json(subcategory);
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      res.status(500).json({ message: "Failed to update subcategory", error: error.message });
    }
  });

  // Delete Subcategory (with cascade check)
  app.delete("/api/admin/subcategories/:id", isAdmin, async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.id);
      console.log("Attempting to delete subcategory with ID:", subcategoryId);
      
      // Check if there are products using this category
      const productsInSubCategory = await db.select().from(products).where(eq(products.subcategoryId, subcategoryId));
      console.log("Products in subcategory:", productsInSubCategory.length);
      
      if (productsInSubCategory.length > 0) {
        return res.status(400).json({ 
          message: `Cannot delete category. ${productsInSubCategory.length} product(s) are using this category. Please delete or reassign the products first.`,
          productsCount: productsInSubCategory.length
        });
      }
      
      const result = await db.delete(subcategories).where(eq(subcategories.id, subcategoryId));
      console.log("Delete subcategory result:", result);
      
      res.json({ message: "Sub Category deleted successfully", subcategoryId, result });
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      res.status(500).json({ message: "Failed to delete subcategory", error: error.message });
    }
  });

  // Get Orders for admin
  app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
      // For now return empty array since orders table might not have data
      res.json([]);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get Custom Quotes for admin
  app.get('/api/admin/quotes', isAdmin, async (req, res) => {
    try {

      const result = await db.select().from(quotes);
      res.json(result);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Get Enquiries for admin
  app.get('/api/admin/enquiries', isAdmin, async (req, res) => {
    try {

      const result = await db.select().from(enquiries);
      res.json(result);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  // Crud Settings for admin
  app.post('/api/admin/settings', isAdmin,upload.single('logo'), async (req, res) => {
    try {
      
      const settingData = req.body;

      Object.entries(settingData).map(([key, value]) => {
       
        // db.insert(settings).values({key : value});
        // Object.entries(settingData).map(([key , value]) => {
          
        // });
        
      });

      res.json([]);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  // Static file serving for uploads
  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join('./uploads', filename);
    res.sendFile(path.resolve(filepath));
  });

  const httpServer = createServer(app);
  return httpServer;

}

async function seedData() {
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    // Seed categories
    const categoriesData = [
      { name: "Custom T-Shirts", slug: "t-shirts", description: "Personalized t-shirts with DTF printing", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300", sortOrder: 1 },
      { name: "Laser Engraved", slug: "laser-engraved", description: "Precision laser engraving on wood and acrylic", imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300", sortOrder: 2 },
      { name: "Vinyl Stickers", slug: "vinyl-stickers", description: "Custom vinyl decals and stickers", imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300", sortOrder: 3 },
      { name: "Keychains", slug: "keychains", description: "Custom keychains in various materials", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300", sortOrder: 4 },
      { name: "Phone Cases", slug: "phone-cases", description: "Custom printed smartphone cases", imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300", sortOrder: 5 },
    ];

    // Insert categories using the database instance
    for (const categoryData of categoriesData) {
      await db.insert(categories).values(categoryData);
    }

    // Seed products
    const productsData = [
      { name: "Classic Cotton T-Shirt", description: "100% cotton, available in multiple colors", categoryId: 1, basePrice: "24.99", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", customizationOptions: { colors: ["white", "black", "blue", "red"], sizes: ["S", "M", "L", "XL"] } },
      { name: "Premium Wooden Plaque", description: "High-quality wood with precision laser engraving", categoryId: 2, basePrice: "39.99", imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", customizationOptions: { sizes: ["Small", "Medium", "Large"], materials: ["Oak", "Pine", "Walnut"] } },
      { name: "Vinyl Sticker Pack", description: "Durable vinyl stickers, weatherproof", categoryId: 3, basePrice: "12.99", imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400", customizationOptions: { quantities: ["5-pack", "10-pack", "25-pack"] } },
      { name: "Custom Keychain", description: "Personalized keychains in various materials", categoryId: 4, basePrice: "8.99", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", customizationOptions: { materials: ["Acrylic", "Wood", "Metal"] } },
    ];

    for (const productData of productsData) {
      await db.insert(products).values(productData);
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}