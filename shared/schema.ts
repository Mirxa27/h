import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profileImage: text("profile_image"),
  isHost: integer("is_host", { mode: "boolean" }).notNull().default(false),
  bio: text("bio"),
  myfatoorahCustomerId: text("myfatoorah_customer_id"), // Renamed from stripeCustomerId
  // stripeSubscriptionId: text("stripe_subscription_id"), // Removed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

// Property table
export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // apartment, house, villa, etc.
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  zipCode: text("zip_code"),
  price: real("price").notNull(),
  cleaningFee: real("cleaning_fee").default(0),
  serviceFee: real("service_fee").default(0),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  maxGuests: integer("max_guests").notNull(),
  amenities: text("amenities", { mode: "json" }).$type<string[]>(),
  images: text("images", { mode: "json" }).$type<string[]>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

// Booking table
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull(),
  guestId: integer("guest_id").notNull(),
  checkIn: integer("check_in", { mode: "timestamp" }).notNull(),
  checkOut: integer("check_out", { mode: "timestamp" }).notNull(),
  totalPrice: real("total_price").notNull(),
  numGuests: integer("num_guests").notNull(),
  status: text("status").notNull(), // pending, confirmed, cancelled, completed
  paymentId: text("payment_id"), // Renamed from stripePaymentIntentId
  paymentStatus: text("payment_status"), // Renamed from stripePaymentStatus
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

// Review table
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull(),
  guestId: integer("guest_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

// Message table
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

// Wishlist table
export const wishlists = sqliteTable("wishlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

// SARA conversation tables
export const saraConversations = sqliteTable("sara_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  conversationId: text("conversation_id").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});

export const saraMessages = sqliteTable("sara_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().defaultNow(),
  metadata: text("metadata", { mode: "json" })
});

// Channel Manager tables
export const channelProviders = sqliteTable("channel_providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // e.g., "Booking.com", "Airbnb", "Expedia"
  slug: text("slug").notNull().unique(), // e.g., "booking-com", "airbnb", "expedia"
  apiEndpoint: text("api_endpoint").notNull(), // Base API URL
  logoUrl: text("logo_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});

export const channelCredentials = sqliteTable("channel_credentials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => channelProviders.id),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  accountId: text("account_id"), // Provider-specific account identifier
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});

export const channelListings = sqliteTable("channel_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  providerId: integer("provider_id").notNull().references(() => channelProviders.id),
  externalListingId: text("external_listing_id").notNull(), // ID on the external platform
  externalListingUrl: text("external_listing_url"), // URL to the listing on the external platform
  status: text("status").notNull(), // "active", "inactive", "error", "pending", etc.
  lastSynced: integer("last_synced", { mode: "timestamp" }),
  syncErrors: text("sync_errors", { mode: "json" }).$type<string[]>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});

export const channelRates = sqliteTable("channel_rates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull().references(() => channelListings.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  price: real("price").notNull(),
  minStay: integer("min_stay"),
  maxStay: integer("max_stay"),
  closedToArrival: integer("closed_to_arrival", { mode: "boolean" }).default(false),
  closedToDeparture: integer("closed_to_departure", { mode: "boolean" }).default(false),
  isClosed: integer("is_closed", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});

export const channelReservations = sqliteTable("channel_reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull().references(() => channelListings.id),
  externalReservationId: text("external_reservation_id").notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  checkIn: integer("check_in", { mode: "timestamp" }).notNull(),
  checkOut: integer("check_out", { mode: "timestamp" }).notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email"),
  guestPhone: text("guest_phone"),
  numberOfGuests: integer("number_of_guests").notNull(),
  totalAmount: real("total_amount").notNull(),
  currencyCode: text("currency_code").notNull().default("SAR"),
  status: text("status").notNull(), // "confirmed", "cancelled", "modified", etc.
  paymentStatus: text("payment_status").notNull(), // "pending", "paid", "refunded", etc.
  hostNotes: text("host_notes"),
  guestNotes: text("guest_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertSaraConversationSchema = createInsertSchema(saraConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaraMessageSchema = createInsertSchema(saraMessages).omit({
  id: true,
  timestamp: true,
});

// Channel Manager Schemas
export const insertChannelProviderSchema = createInsertSchema(channelProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChannelCredentialsSchema = createInsertSchema(channelCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChannelListingSchema = createInsertSchema(channelListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChannelRateSchema = createInsertSchema(channelRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChannelReservationSchema = createInsertSchema(channelReservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties, { relationName: "host" }),
  bookings: many(bookings, { relationName: "guest" }),
  reviews: many(reviews, { relationName: "guest" }),
  wishlists: many(wishlists, { relationName: "user" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  saraConversations: many(saraConversations, { relationName: "userConversations" }),
  channelCredentials: many(channelCredentials, { relationName: "userCredentials" }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  host: one(users, {
    fields: [properties.hostId],
    references: [users.id],
    relationName: "host",
  }),
  bookings: many(bookings, { relationName: "property" }),
  reviews: many(reviews, { relationName: "property" }),
  wishlists: many(wishlists, { relationName: "property" }),
  channelListings: many(channelListings, { relationName: "propertyListings" }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
    relationName: "property",
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
    relationName: "guest",
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, {
    fields: [reviews.propertyId],
    references: [properties.id],
    relationName: "property",
  }),
  guest: one(users, {
    fields: [reviews.guestId],
    references: [users.id],
    relationName: "guest",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
    relationName: "user",
  }),
  property: one(properties, {
    fields: [wishlists.propertyId],
    references: [properties.id],
    relationName: "property",
  }),
}));

export const saraConversationsRelations = relations(saraConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [saraConversations.userId],
    references: [users.id],
    relationName: "userConversations",
  }),
  messages: many(saraMessages, { relationName: "conversation" }),
}));

export const saraMessagesRelations = relations(saraMessages, ({ one }) => ({
  conversation: one(saraConversations, {
    fields: [saraMessages.conversationId],
    references: [saraConversations.conversationId],
    relationName: "conversation",
  }),
}));

// Channel Manager Relations
export const channelProvidersRelations = relations(channelProviders, ({ many }) => ({
  credentials: many(channelCredentials, { relationName: "provider" }),
  listings: many(channelListings, { relationName: "provider" }),
}));

export const channelCredentialsRelations = relations(channelCredentials, ({ one }) => ({
  user: one(users, {
    fields: [channelCredentials.userId],
    references: [users.id],
    relationName: "userCredentials",
  }),
  provider: one(channelProviders, {
    fields: [channelCredentials.providerId],
    references: [channelProviders.id],
    relationName: "provider",
  }),
}));

export const channelListingsRelations = relations(channelListings, ({ one, many }) => ({
  property: one(properties, {
    fields: [channelListings.propertyId],
    references: [properties.id],
    relationName: "propertyListings",
  }),
  provider: one(channelProviders, {
    fields: [channelListings.providerId],
    references: [channelProviders.id],
    relationName: "provider",
  }),
  rates: many(channelRates, { relationName: "listing" }),
  reservations: many(channelReservations, { relationName: "listing" }),
}));

export const channelRatesRelations = relations(channelRates, ({ one }) => ({
  listing: one(channelListings, {
    fields: [channelRates.listingId],
    references: [channelListings.id],
    relationName: "listing",
  }),
}));

export const channelReservationsRelations = relations(channelReservations, ({ one }) => ({
  listing: one(channelListings, {
    fields: [channelReservations.listingId],
    references: [channelListings.id],
    relationName: "listing",
  }),
  booking: one(bookings, {
    fields: [channelReservations.bookingId],
    references: [bookings.id],
    relationName: "channelReservation",
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type SaraConversation = typeof saraConversations.$inferSelect;
export type InsertSaraConversation = z.infer<typeof insertSaraConversationSchema>;

export type SaraMessage = typeof saraMessages.$inferSelect;
export type InsertSaraMessage = z.infer<typeof insertSaraMessageSchema>;

// Channel Manager Types
export type ChannelProvider = typeof channelProviders.$inferSelect;
export type InsertChannelProvider = z.infer<typeof insertChannelProviderSchema>;

export type ChannelCredential = typeof channelCredentials.$inferSelect;
export type InsertChannelCredential = z.infer<typeof insertChannelCredentialsSchema>;

export type ChannelListing = typeof channelListings.$inferSelect;
export type InsertChannelListing = z.infer<typeof insertChannelListingSchema>;

export type ChannelRate = typeof channelRates.$inferSelect;
export type InsertChannelRate = z.infer<typeof insertChannelRateSchema>;

export type ChannelReservation = typeof channelReservations.$inferSelect;
export type InsertChannelReservation = z.infer<typeof insertChannelReservationSchema>;
