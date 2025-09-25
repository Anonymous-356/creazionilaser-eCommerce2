import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("customer"), // customer, artist, admin
  isBlocked: integer("is_blocked").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artist profiles
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  specialty: varchar("specialty"),
  socialLinks: jsonb("social_links"),
  portfolio : varchar("portfolio"),
  isVerified: boolean("is_verified").default(false),
  isRejected: boolean("is_rejected").notNull().default(false),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0.30"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Product categories
export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId : integer("category_id").notNull().unique(),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  sortOrder: integer("sort_order").default(0),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  subcategoryId: integer("subcategory_id").references(() => subcategories.id),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url").notNull(),
  customizationOptions: jsonb("customization_options"), // colors, sizes, materials
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Artist designs
export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url").notNull(),
  fileUrl: varchar("file_url"), // high-res download URL
  tags: jsonb("tags"),
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  isPublic: boolean("is_public").default(false),
  isRejected: boolean("is_rejected").default(false),
  downloadCount: integer("download_count").$type<number>().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  designId: integer("design_id").references(() => designs.id),
  quantity: integer("quantity").notNull().default(1),
  customization: jsonb("customization"), // size, color, text, etc.
  price: decimal("price", { precision: 10, scale: 2 }).$type<number>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderNumber: varchar("order_number").notNull().unique(),
  status: varchar("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).$type<number>().notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  paymentStatus: varchar("payment_status").default("pending"), // pending, processed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  designId: integer("design_id").references(() => designs.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  customization: jsonb("customization"),
  artistCommission: decimal("artist_commission", { precision: 10, scale: 2 }),
});

// Quotes
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: varchar("title").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  attachment: varchar("attachment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enquires
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: varchar("title").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  attachment: varchar("attachment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  value: varchar("value").notNull(),
});

// Settings
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  designId: integer("design_id").notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertArtistSchema = createInsertSchema(artists);
export const insertCategorySchema = createInsertSchema(categories);
export const insertSubCategorySchema = createInsertSchema(subcategories);
export const insertProductSchema = createInsertSchema(products);
export const insertDesignSchema = createInsertSchema(designs);
export const insertWishlistSchema = createInsertSchema(wishlist);
export const insertQuotesSchema = createInsertSchema(quotes);
export const insertEnquiriesSchema = createInsertSchema(enquiries);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertSettingsSchema = createInsertSchema(settings);

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Artist = typeof artists.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Design = typeof designs.$inferSelect;
export type Wishlist = typeof wishlist.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Settings = typeof settings.$inferSelect;
