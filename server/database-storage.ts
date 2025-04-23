import {
  users, properties, bookings, reviews, messages, wishlists,
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Booking, type InsertBooking,
  type Review, type InsertReview,
  type Message, type InsertMessage,
  type Wishlist, type InsertWishlist
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getProperties(filters?: Partial<Property>): Promise<Property[]> {
    let query = db.select().from(properties);
    
    if (filters) {
      const conditions = [];
      
      if (filters.type) {
        conditions.push(eq(properties.type, String(filters.type)));
      }
      
      if (filters.city) {
        conditions.push(eq(properties.city, String(filters.city)));
      }
      
      if (filters.country) {
        conditions.push(eq(properties.country, String(filters.country)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  async getPropertiesByHost(hostId: number): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.hostId, hostId));
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set(propertyData)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return !!result;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.propertyId, propertyId));
  }

  async getBookingsByGuest(guestId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.guestId, guestId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.propertyId, propertyId));
  }

  async getReviewsByGuest(guestId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.guestId, guestId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId1),
            eq(messages.receiverId, userId2)
          ),
          and(
            eq(messages.senderId, userId2),
            eq(messages.receiverId, userId1)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUserConversations(userId: number): Promise<Array<{ user: User, lastMessage: Message }>> {
    // This is more complex with SQL, let's implement a version that works
    // First, get all messages where the user is either sender or receiver
    const userMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      );
    
    // Get the unique users this user has conversations with
    const conversationPartnerIds = new Set<number>();
    userMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      conversationPartnerIds.add(partnerId);
    });
    
    // For each partner, find their user record and the latest message
    const conversations: Array<{ user: User, lastMessage: Message }> = [];
    
    for (const partnerId of conversationPartnerIds) {
      const [partner] = await db
        .select()
        .from(users)
        .where(eq(users.id, partnerId));
      
      if (partner) {
        // Get the most recent message between these users
        const [latestMessage] = await db
          .select()
          .from(messages)
          .where(
            or(
              and(
                eq(messages.senderId, userId),
                eq(messages.receiverId, partnerId)
              ),
              and(
                eq(messages.senderId, partnerId),
                eq(messages.receiverId, userId)
              )
            )
          )
          .orderBy(desc(messages.createdAt))
          .limit(1);
        
        if (latestMessage) {
          conversations.push({
            user: partner,
            lastMessage: latestMessage
          });
        }
      }
    }
    
    return conversations;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values({...message, isRead: false}).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Wishlist operations
  async getWishlist(id: number): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));
    return wishlist;
  }

  async getWishlistsByUser(userId: number): Promise<{ wishlist: Wishlist, property: Property }[]> {
    const userWishlists = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId));
    
    const wishlistItems: { wishlist: Wishlist, property: Property }[] = [];
    
    for (const wishlist of userWishlists) {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, wishlist.propertyId));
      
      if (property) {
        wishlistItems.push({ wishlist, property });
      }
    }
    
    return wishlistItems;
  }

  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if wishlist already exists for this user and property
    const [existing] = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, wishlist.userId),
          eq(wishlists.propertyId, wishlist.propertyId)
        )
      );
    
    if (existing) {
      return existing;
    }
    
    const [newWishlist] = await db
      .insert(wishlists)
      .values(wishlist)
      .returning();
      
    return newWishlist;
  }

  async deleteWishlist(id: number): Promise<boolean> {
    const result = await db
      .delete(wishlists)
      .where(eq(wishlists.id, id));
      
    return !!result;
  }

  async isPropertyInWishlist(userId: number, propertyId: number): Promise<boolean> {
    const [wishlist] = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.propertyId, propertyId)
        )
      );
      
    return !!wishlist;
  }
}