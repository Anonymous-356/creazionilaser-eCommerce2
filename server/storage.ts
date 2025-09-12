import {
  users,
  artists,
  quotes,
  categories,
  products,
  designs,
  wishlist,
  enquiries,
  cartItems,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type Artist,
  type Quote,
  type Category,
  type Product,
  type Design,
  type Wishlist,
  type Enquiry,
  type CartItem,
  type Order,
  type OrderItem,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, sql,Query } from "drizzle-orm";
import { on } from "events";

export interface IStorage {

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Artist operations
  createArtist(artistData: typeof artists.$inferInsert): Promise<Artist>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistByUserId(userId: number): Promise<Artist | undefined>;
  getAllArtists(): Promise<Artist[]>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(categoryData: typeof categories.$inferInsert): Promise<Category>;
  updateCategory(id: number, categoryData: Partial<typeof categories.$inferInsert>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(productData: typeof products.$inferInsert): Promise<Product>;
  updateProduct(id: number, productData: Partial<typeof products.$inferInsert>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Design operations
  createDesign(designData: typeof designs.$inferInsert): Promise<Design>;
  getDesignsByArtist(artistId: number): Promise<Design[]>;
  getAllDesigns(): Promise<Design[]>;
  getDesign(id: number): Promise<Design | undefined>;
  
  // Cart operations
  addToCart(cartData: typeof cartItems.$inferInsert): Promise<CartItem>;
  getCartItems(userId: number): Promise<CartItem[]>;
  updateCartItem(id: number, quantity: number): Promise<void>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Order operations
  createOrder(orderData: typeof orders.$inferInsert, items: typeof orderItems.$inferInsert[]): Promise<Order>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;

  // Quote operations
  submitQuote(quoteData: typeof quotes.$inferInsert): Promise<Quote>;
  getQuotes(): Promise<Quote[]>;

  // Enquiries operations
  submitEnquiry(enquiryData: typeof enquiries.$inferInsert): Promise<Enquiry>;
  getEnquiries(): Promise<Enquiry[]>;

  // Profile operations

  getUserWishlist(userId: number) : Promise<Wishlist[]>;

}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Artist operations
  async createArtist(artistData: typeof artists.$inferInsert): Promise<Artist> {
 
    const [artist] = await db.insert(artists).values(artistData).returning();
    return artist;
  }

  async getArtist(id: number): Promise <Artist | undefined> {

    const artist = await db.select({
        id : artists.id,
        userId: artists.userId,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        speciality : artists.specialty,
        biography : artists.bio,
        imageUrl : users.profileImageUrl,
        portfolio : artists.portfolio,
        isVerified : artists.isVerified,
        isBlocked : artists.isBlocked,
        socialLinks : artists.socialLinks,
        createdAt: artists.createdAt,
        updatedAt: artists.updatedAt,
    }).from(artists).innerJoin(users, eq(artists.userId , users.id)).where(eq(artists.id,id));

    return artist[0];
  }

  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    
     const artist = await db.select({
        id : artists.id,
        userId: artists.userId,
        specialty : artists.specialty,
        biography : artists.bio,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        portfolio : artists.portfolio,
        isVerified : artists.isVerified,
        isBlocked : artists.isBlocked,
        socialLinks : artists.socialLinks,
        commissionRate : artists.commissionRate,
        imageUrl : users.profileImageUrl,
        userType: users.userType,
        createdAt: artists.createdAt,
    }).from(artists).innerJoin(users, eq(artists.userId , users.id)).where(eq(artists.userId,userId));

    return artist[0];

  }

  async getAllArtists(): Promise<Artist[]> {

  const allArtists = await db.select({
        id : artists.id,
        userId: users.id,
        specialty : artists.specialty,
        biography : artists.bio,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        isVerified : artists.isVerified,
        isBlocked : artists.isBlocked,
        socialLinks : artists.socialLinks,
        imageUrl : users.profileImageUrl,
        userType: users.userType,
        createdAt: artists.createdAt,
        updatedAt : artists.updatedAt,
      }).from(artists).innerJoin(users, eq(artists.userId , users.id));
      
   return allArtists; 
   
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(categoryData: typeof categories.$inferInsert): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<typeof categories.$inferInsert>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  // Design operations
  async createDesign(designData: typeof designs.$inferInsert): Promise<Design> {
    const [design] = await db.insert(designs).values(designData).returning();
    return design;
  }

  async getDesignsByArtist(artistId: number): Promise<Design[]> {
    return await db.select(
        {
          id : designs.id,
          artistId : designs.artistId,
          price: designs.price,
          title:designs.title,
          description:designs.description,
          imageUrl:designs.imageUrl,
          downloadCount:designs.downloadCount, 
          artistuserID : artists.userId,
          artistFirstName : users.firstName,
          artistLastName:users.lastName
        }
      ).from(designs)
      .innerJoin(artists, eq(artists.id , designs.artistId))
      .innerJoin(users, eq(users.id , artists.userId))
      .where(and(eq(designs.artistId, artistId), eq(designs.isPublic, true)))
      .orderBy(desc(designs.createdAt));
  }

  async getAllDesigns(): Promise<Design[]> {
    return await db.select(
      {
          id : designs.id,
          artistId : designs.artistId,
          price: designs.price,
          title:designs.title,
          description:designs.description,
          imageUrl:designs.imageUrl,
          artistuserID : artists.userId,
          artistFirstName : users.firstName,
          artistLastName:users.lastName
        }
    ).from(designs)
      .innerJoin(artists, eq(artists.id , designs.artistId))
      .innerJoin(users, eq(users.id , artists.userId))
      .where(eq(designs.isPublic, true))
      .orderBy(desc(designs.createdAt));
  }

  async getDesign(id: number): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design;
  }

  // Cart operations
  async addToCart(cartData: typeof cartItems.$inferInsert): Promise<CartItem> {
    const [item] = await db.insert(cartItems).values(cartData).returning();
    return item;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async updateCartItem(id: number, quantity: number): Promise<void> {
    await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id));
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(orderData: typeof orders.$inferInsert, items: typeof orderItems.$inferInsert[]): Promise<Order> {
   
    const [order] = await db.insert(orders).values(orderData).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: order.id,
    }));
    
    await db.insert(orderItems).values(orderItemsWithOrderId);
    
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  // Quotes operations
  async submitQuote(quoteData: typeof quotes.$inferInsert): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(quoteData).returning();
    return quote;
  }

   async getQuotes(): Promise<Quote[]> {
    const [result] = await db.select().from(quotes);
    return result;
  }

  // Enquiries operations
  async submitEnquiry(enquiryData: typeof enquiries.$inferInsert): Promise<Enquiry> {
    const [enquiry] = await db.insert(enquiries).values(enquiryData).returning();
    return enquiry;
  }

   async getEnquiries(): Promise<Enquiry[]> {
    const [result] = await db.select().from(enquiries);
    return result;
  }

  // Profile operations 

  async getUserWishlist(userId : number) : Promise <Wishlist[]>{

    const wishlistResult = await db.select(
      {
        id : designs.id,
        price: designs.price,
        title:designs.title,
        description:designs.description,
        imageUrl:designs.imageUrl,
      }
      ).from(wishlist)
      .innerJoin(designs, eq(wishlist.designId , designs.id))
      .where(eq(wishlist.userId, userId))

    return wishlistResult;
  }

}

export const storage = new DatabaseStorage();
