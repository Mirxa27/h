var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bookings: () => bookings,
  bookingsRelations: () => bookingsRelations,
  channelCredentials: () => channelCredentials,
  channelCredentialsRelations: () => channelCredentialsRelations,
  channelListings: () => channelListings,
  channelListingsRelations: () => channelListingsRelations,
  channelProviders: () => channelProviders,
  channelProvidersRelations: () => channelProvidersRelations,
  channelRates: () => channelRates,
  channelRatesRelations: () => channelRatesRelations,
  channelReservations: () => channelReservations,
  channelReservationsRelations: () => channelReservationsRelations,
  insertBookingSchema: () => insertBookingSchema,
  insertChannelCredentialsSchema: () => insertChannelCredentialsSchema,
  insertChannelListingSchema: () => insertChannelListingSchema,
  insertChannelProviderSchema: () => insertChannelProviderSchema,
  insertChannelRateSchema: () => insertChannelRateSchema,
  insertChannelReservationSchema: () => insertChannelReservationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertPropertySchema: () => insertPropertySchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSaraConversationSchema: () => insertSaraConversationSchema,
  insertSaraMessageSchema: () => insertSaraMessageSchema,
  insertUserSchema: () => insertUserSchema,
  insertWishlistSchema: () => insertWishlistSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  properties: () => properties,
  propertiesRelations: () => propertiesRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  saraConversations: () => saraConversations,
  saraConversationsRelations: () => saraConversationsRelations,
  saraMessages: () => saraMessages,
  saraMessagesRelations: () => saraMessagesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  wishlists: () => wishlists,
  wishlistsRelations: () => wishlistsRelations
});
import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
var users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profileImage: text("profile_image"),
  isHost: integer("is_host", { mode: "boolean" }).notNull().default(false),
  bio: text("bio"),
  myfatoorahCustomerId: text("myfatoorah_customer_id"),
  // Renamed from stripeCustomerId
  // stripeSubscriptionId: text("stripe_subscription_id"), // Removed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow()
});
var properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hostId: integer("host_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  // apartment, house, villa, etc.
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
  amenities: text("amenities", { mode: "json" }).$type(),
  images: text("images", { mode: "json" }).$type(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow()
});
var bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull(),
  guestId: integer("guest_id").notNull(),
  checkIn: integer("check_in", { mode: "timestamp" }).notNull(),
  checkOut: integer("check_out", { mode: "timestamp" }).notNull(),
  totalPrice: real("total_price").notNull(),
  numGuests: integer("num_guests").notNull(),
  status: text("status").notNull(),
  // pending, confirmed, cancelled, completed
  paymentId: text("payment_id"),
  // Renamed from stripePaymentIntentId
  paymentStatus: text("payment_status"),
  // Renamed from stripePaymentStatus
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow()
});
var reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull(),
  guestId: integer("guest_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow()
});
var messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow()
});
var wishlists = sqliteTable("wishlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow()
});
var saraConversations = sqliteTable("sara_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  conversationId: text("conversation_id").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});
var saraMessages = sqliteTable("sara_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().defaultNow(),
  metadata: text("metadata", { mode: "json" })
});
var channelProviders = sqliteTable("channel_providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  // e.g., "Booking.com", "Airbnb", "Expedia"
  slug: text("slug").notNull().unique(),
  // e.g., "booking-com", "airbnb", "expedia"
  apiEndpoint: text("api_endpoint").notNull(),
  // Base API URL
  logoUrl: text("logo_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});
var channelCredentials = sqliteTable("channel_credentials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => channelProviders.id),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  accountId: text("account_id"),
  // Provider-specific account identifier
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});
var channelListings = sqliteTable("channel_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  providerId: integer("provider_id").notNull().references(() => channelProviders.id),
  externalListingId: text("external_listing_id").notNull(),
  // ID on the external platform
  externalListingUrl: text("external_listing_url"),
  // URL to the listing on the external platform
  status: text("status").notNull(),
  // "active", "inactive", "error", "pending", etc.
  lastSynced: integer("last_synced", { mode: "timestamp" }),
  syncErrors: text("sync_errors", { mode: "json" }).$type(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});
var channelRates = sqliteTable("channel_rates", {
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
var channelReservations = sqliteTable("channel_reservations", {
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
  status: text("status").notNull(),
  // "confirmed", "cancelled", "modified", etc.
  paymentStatus: text("payment_status").notNull(),
  // "pending", "paid", "refunded", etc.
  hostNotes: text("host_notes"),
  guestNotes: text("guest_notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true
});
var insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true
});
var insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true
});
var insertSaraConversationSchema = createInsertSchema(saraConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSaraMessageSchema = createInsertSchema(saraMessages).omit({
  id: true,
  timestamp: true
});
var insertChannelProviderSchema = createInsertSchema(channelProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertChannelCredentialsSchema = createInsertSchema(channelCredentials).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertChannelListingSchema = createInsertSchema(channelListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertChannelRateSchema = createInsertSchema(channelRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertChannelReservationSchema = createInsertSchema(channelReservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var usersRelations = relations(users, ({ many }) => ({
  properties: many(properties, { relationName: "host" }),
  bookings: many(bookings, { relationName: "guest" }),
  reviews: many(reviews, { relationName: "guest" }),
  wishlists: many(wishlists, { relationName: "user" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  saraConversations: many(saraConversations, { relationName: "userConversations" }),
  channelCredentials: many(channelCredentials, { relationName: "userCredentials" })
}));
var propertiesRelations = relations(properties, ({ one, many }) => ({
  host: one(users, {
    fields: [properties.hostId],
    references: [users.id],
    relationName: "host"
  }),
  bookings: many(bookings, { relationName: "property" }),
  reviews: many(reviews, { relationName: "property" }),
  wishlists: many(wishlists, { relationName: "property" }),
  channelListings: many(channelListings, { relationName: "propertyListings" })
}));
var bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
    relationName: "property"
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
    relationName: "guest"
  })
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, {
    fields: [reviews.propertyId],
    references: [properties.id],
    relationName: "property"
  }),
  guest: one(users, {
    fields: [reviews.guestId],
    references: [users.id],
    relationName: "guest"
  })
}));
var messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver"
  })
}));
var wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
    relationName: "user"
  }),
  property: one(properties, {
    fields: [wishlists.propertyId],
    references: [properties.id],
    relationName: "property"
  })
}));
var saraConversationsRelations = relations(saraConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [saraConversations.userId],
    references: [users.id],
    relationName: "userConversations"
  }),
  messages: many(saraMessages, { relationName: "conversation" })
}));
var saraMessagesRelations = relations(saraMessages, ({ one }) => ({
  conversation: one(saraConversations, {
    fields: [saraMessages.conversationId],
    references: [saraConversations.conversationId],
    relationName: "conversation"
  })
}));
var channelProvidersRelations = relations(channelProviders, ({ many }) => ({
  credentials: many(channelCredentials, { relationName: "provider" }),
  listings: many(channelListings, { relationName: "provider" })
}));
var channelCredentialsRelations = relations(channelCredentials, ({ one }) => ({
  user: one(users, {
    fields: [channelCredentials.userId],
    references: [users.id],
    relationName: "userCredentials"
  }),
  provider: one(channelProviders, {
    fields: [channelCredentials.providerId],
    references: [channelProviders.id],
    relationName: "provider"
  })
}));
var channelListingsRelations = relations(channelListings, ({ one, many }) => ({
  property: one(properties, {
    fields: [channelListings.propertyId],
    references: [properties.id],
    relationName: "propertyListings"
  }),
  provider: one(channelProviders, {
    fields: [channelListings.providerId],
    references: [channelProviders.id],
    relationName: "provider"
  }),
  rates: many(channelRates, { relationName: "listing" }),
  reservations: many(channelReservations, { relationName: "listing" })
}));
var channelRatesRelations = relations(channelRates, ({ one }) => ({
  listing: one(channelListings, {
    fields: [channelRates.listingId],
    references: [channelListings.id],
    relationName: "listing"
  })
}));
var channelReservationsRelations = relations(channelReservations, ({ one }) => ({
  listing: one(channelListings, {
    fields: [channelReservations.listingId],
    references: [channelListings.id],
    relationName: "listing"
  }),
  booking: one(bookings, {
    fields: [channelReservations.bookingId],
    references: [bookings.id],
    relationName: "channelReservation"
  })
}));

// server/routes.ts
import { and, eq, desc, asc } from "drizzle-orm";
import session from "express-session";
import { createServer } from "http";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// server/ai.ts
import OpenAI from "openai";
import { sql } from "drizzle-orm";
var openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (process.env.NODE_ENV === "development") {
  console.warn("OPENAI_API_KEY not found. Using mock OpenAI client for development.");
  openai = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                recommendations: [],
                summary: "This is a mock response for development."
              })
            }
          }]
        })
      }
    }
  };
} else {
  throw new Error("OPENAI_API_KEY environment variable is required in production");
}
async function generatePropertyRecommendations(preferences, availableProperties = [], userPreferences = null) {
  try {
    const context = `
      Available Properties: ${JSON.stringify(availableProperties, null, 2)}
      ${userPreferences ? `User Preferences: ${JSON.stringify(userPreferences, null, 2)}` : ""}

      Instructions for JSON Response:
      - Match properties that align with the user's preferences
      - Consider location, price range, number of guests, amenities, and dates
      - Prices are in Saudi Riyal (SAR/\u0631.\u0633)
      - Return only properties that exist in the available properties list
      - Rank properties by relevance to the user's criteria
      - Include detailed reasoning for each recommendation
      - For each property, provide:
          1. Score (0 to 1) indicating match quality
          2. A detailed explanation (max 150 chars) of why it matches the user's needs
          3. Matched criteria as an array of specific tags
          4. Highlight unique selling points of each property
          5. Suggest conversation follow-ups related to each property
      - Also include a summary section explaining the overall recommendations in a conversational tone
      - Include 2-3 follow-up questions the user might want to ask
      - Format your response as JSON
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI property recommendation assistant for Habibistay. You must provide all responses as JSON objects. ${context}`
        },
        {
          role: "user",
          content: `Find me properties with these preferences: ${JSON.stringify(preferences)}. I need your response in JSON format like this example:
          {
            "recommendations": [
              {
                "id": 123,
                "score": 0.95,
                "explanation": "Perfect match for your budget and location preferences",
                "matchedCriteria": ["Budget-friendly", "Great location", "Spacious"]
              }
            ],
            "summary": "I found 3 properties that match your criteria. The top recommendation is..."
          }`
        }
      ],
      response_format: { type: "json_object" }
    });
    if (response.choices[0].message.content) {
      const result = JSON.parse(response.choices[0].message.content);
      if (availableProperties.length > 0) {
        if (result.recommendations && Array.isArray(result.recommendations)) {
          const enhancedRecommendations = result.recommendations.map((rec) => {
            const matchingProperty = availableProperties.find(
              (p) => p.id === rec.id || p.id === rec.propertyId || p.title === rec.propertyTitle
            );
            if (matchingProperty) {
              return {
                ...matchingProperty,
                score: rec.score || 0,
                explanation: rec.explanation || "Matches your preferences",
                matchedCriteria: rec.matchedCriteria || []
              };
            }
            return rec;
          }).filter(Boolean);
          return {
            recommendations: enhancedRecommendations,
            summary: result.summary || "Here are some properties that match your preferences"
          };
        }
      }
      return result;
    } else {
      return { error: "No response generated" };
    }
  } catch (error) {
    console.error("Error generating property recommendations:", error.message);
    throw new Error("Failed to generate property recommendations");
  }
}
async function generateBookingAssistantResponse(userMessage, previousMessages = [], user = null, availableProperties = [], bookingStep = null, bookingDetails = null, userPreferences = null) {
  try {
    let context = `
      Available Properties: ${JSON.stringify(availableProperties, null, 2)}

      Instructions:
      - You are a super-intelligent AI property assistant with deep knowledge of real estate
      - Always start conversations by showing 2 available properties to engage users immediately
      - Help users find properties based on their preferences with smart filtering
      - Remember user preferences across the conversation and personalize recommendations
      - Offer advanced filtering options like price range, location, amenities, property type
      - Suggest properties that match user's implicit preferences based on conversation history
      - Answer questions about amenities, locations, and availability with expert knowledge
      - Guide users through the booking process step by step with a consultative approach
      - Offer friendly, concise responses in Saudi Arabian context
      - Prices are in Saudi Riyal (SAR/\u0631.\u0633)
      - Be polite, professional, and show your expertise in property recommendations
      - Keep responses concise and informative
      - Never show more than 2 properties at a time to avoid overwhelming users
    `;
    if (bookingStep) {
      context += `
      Current booking step: ${bookingStep}
      Booking details: ${JSON.stringify(bookingDetails, null, 2)}
      `;
    }
    if (user) {
      context += `
      User: ${user.name} (ID: ${user.id})
      `;
    }
    const systemMessage = {
      role: "system",
      content: `You are SARA (Sophisticated AI Rental Assistant) for Habibistay, a luxury property rental platform in Saudi Arabia. You are a super-intelligent AI with deep knowledge of real estate and property recommendations. You have access to advanced filtering tools to help users find their perfect property.

      Your smart filtering capabilities include:
      - Price range filtering (budget-friendly to luxury)
      - Location-based recommendations (neighborhoods, proximity to landmarks)
      - Amenity matching (pool, gym, parking, etc.)
      - Property type filtering (apartments, villas, houses)
      - Guest capacity optimization
      - View and feature preferences

      Conversational Guidelines:
      - Maintain a warm, friendly, and professional tone throughout the conversation
      - Use natural conversational transitions rather than robotic responses
      - Ask follow-up questions to better understand user preferences
      - Acknowledge user preferences and refer back to them in later messages
      - Provide personalized property recommendations with specific reasons why they match user needs
      - Anticipate user needs based on their previous messages and implicit preferences
      - Use conversational markers like "By the way" or "I noticed you mentioned" to create flow
      - Offer helpful suggestions when users seem unsure about what they want
      - Respond empathetically to user concerns or questions
      - Maintain conversation history and context across multiple exchanges
      - Suggest relevant amenities or features users might not have considered
      - Provide local insights about neighborhoods and attractions near properties

      Always offer filtering options naturally in conversation when users are searching for properties. Remember user preferences across the conversation and use them to personalize future recommendations.

      Whenever returning formatted data, use JSON format. ${context}`
    };
    const chatHistory = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));
    const currentMessage = {
      role: "user",
      content: userMessage
    };
    let options = [];
    if (bookingStep === "date_selection") {
      options = [
        { label: "Today", value: "today" },
        { label: "Tomorrow", value: "tomorrow" },
        { label: "This weekend", value: "weekend" },
        { label: "Next week", value: "next_week" }
      ];
    } else if (bookingStep === "guest_selection") {
      options = [
        { label: "1 guest", value: "1" },
        { label: "2 guests", value: "2" },
        { label: "3 guests", value: "3" },
        { label: "4+ guests", value: "4+" }
      ];
    } else if (bookingStep === "payment_selection") {
      options = [
        { label: "Credit Card", value: "credit_card" },
        { label: "Mada", value: "mada" },
        { label: "Apple Pay", value: "apple_pay" }
      ];
    } else if (!bookingStep && userMessage.toLowerCase().includes("help")) {
      options = [
        { label: "Find a property", value: "find_property", icon: "search" },
        { label: "Book a stay", value: "book_stay", icon: "calendar" },
        { label: "Payment help", value: "payment_help", icon: "credit-card" },
        { label: "Contact support", value: "contact_support", icon: "help-circle" }
      ];
    }
    const extractionMessage = {
      role: "system",
      content: `After generating your response, please also identify:
      1. 2-3 natural follow-up questions the user might want to ask
      2. Key topics discussed in this conversation
      3. Any user preferences mentioned (explicit or implicit)
      4. The current state of the conversation (e.g., "exploring_properties", "booking_process", "general_inquiry")

      Format this additional information as JSON at the end of your response, surrounded by <context> tags like this:
      <context>
      {
        "suggestedFollowUps": ["Question 1?", "Question 2?", "Question 3?"],
        "recentTopics": ["topic1", "topic2"],
        "userPreferences": { "key": "value" },
        "conversationState": "state_name"
      }
      </context>

      This JSON will be extracted and not shown to the user.`
    };
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...chatHistory, currentMessage, extractionMessage],
      temperature: 0.7
    });
    let content = response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
    let suggestedFollowUps;
    let conversationContext;
    const contextMatch = content.match(/<context>([\s\S]*?)<\/context>/i);
    if (contextMatch && contextMatch[1]) {
      try {
        const contextData = JSON.parse(contextMatch[1]);
        suggestedFollowUps = contextData.suggestedFollowUps;
        conversationContext = {
          recentTopics: contextData.recentTopics,
          userPreferences: contextData.userPreferences,
          conversationState: contextData.conversationState
        };
        content = content.replace(/<context>[\s\S]*?<\/context>/i, "").trim();
      } catch (error) {
        console.error("Error parsing context JSON:", error);
      }
    }
    return {
      message: content,
      options: options.length > 0 ? options : void 0,
      suggestedFollowUps,
      conversationContext
    };
  } catch (error) {
    console.error("Error generating assistant response:", error.message);
    return {
      message: "I'm sorry, I'm having trouble understanding your request right now. Could you try again?",
      options: [
        { label: "Find a property", value: "find_property", icon: "search" },
        { label: "Contact support", value: "contact_support", icon: "help-circle" }
      ]
    };
  }
}
async function generatePricingRecommendations(propertyData, marketData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a pricing optimization assistant for Habibistay. Recommend optimal pricing based on property details and market data. Provide your output in JSON format."
        },
        {
          role: "user",
          content: `
            Generate pricing recommendations as a JSON object for this property:
            Property data: ${JSON.stringify(propertyData)}
            Market data: ${JSON.stringify(marketData)}
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      return { error: "No pricing recommendations generated" };
    }
  } catch (error) {
    console.error("Error generating pricing recommendations:", error.message);
    throw new Error("Failed to generate pricing recommendations");
  }
}

// server/db.ts
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/better-sqlite3";
if (process.env.NODE_ENV === "development") {
  dotenv.config();
}
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var dbPath = process.env.DATABASE_URL.replace("file:", "");
var sqlite = new Database(dbPath);
var db = drizzle(sqlite, { schema: schema_exports });

// server/myfatoorah.ts
import axios from "axios";
var API_URL = "https://apitest.myfatoorah.com";
var PAYMENT_URL = `${API_URL}/v2/InitiatePayment`;
var EXECUTE_URL = `${API_URL}/v2/ExecutePayment`;
var PAYMENT_STATUS_URL = `${API_URL}/v2/GetPaymentStatus`;
var CUSTOMER_URL = `${API_URL}/v2/CreateCustomer`;
var SAR_SYMBOL = "\u0631.\u0633";
var makeRequest = async (url, data) => {
  if (!process.env.MYFATOORAH_API_KEY) {
    throw new Error("MYFATOORAH_API_KEY environment variable not set");
  }
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Authorization": `Bearer ${process.env.MYFATOORAH_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("MyFatoorah API error:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`MyFatoorah API error: ${error.response.data.Message || error.message}`);
    }
    throw error;
  }
};
async function createPayment(amount, bookingDetails) {
  const initResponse = await makeRequest(PAYMENT_URL, {
    InvoiceAmount: amount,
    CurrencyIso: "SAR",
    Language: "en"
  });
  const executeData = {
    PaymentMethodId: initResponse.Data.PaymentMethods[0].PaymentMethodId,
    // Use the first available payment method
    InvoiceValue: amount,
    CallBackUrl: `${process.env.APP_URL || "http://localhost:5000"}/api/payment/callback`,
    ErrorUrl: `${process.env.APP_URL || "http://localhost:5000"}/api/payment/error`,
    CustomerName: "Guest User",
    // You might want to replace this with actual user info
    DisplayCurrencyIso: "SAR",
    MobileCountryCode: "966",
    // Saudi Arabia country code
    CustomerMobile: "555555555",
    // This would be replaced with actual user info
    CustomerEmail: "guest@habibistay.com",
    // This would be replaced with actual user info
    Language: "en",
    CustomerReference: `booking_${Date.now()}`,
    InvoiceItems: [
      {
        ItemName: "Property Booking",
        Quantity: 1,
        UnitPrice: amount
      }
    ],
    UserDefinedField: JSON.stringify(bookingDetails)
  };
  const executeResponse = await makeRequest(EXECUTE_URL, executeData);
  return {
    paymentId: executeResponse.Data.InvoiceId,
    paymentUrl: executeResponse.Data.PaymentURL,
    amount: executeResponse.Data.InvoiceValue,
    currencySymbol: SAR_SYMBOL
  };
}
async function getPaymentStatus(paymentId) {
  const response = await makeRequest(PAYMENT_STATUS_URL, {
    Key: paymentId,
    KeyType: "InvoiceId"
  });
  return {
    paymentId: response.Data.InvoiceId,
    status: response.Data.InvoiceStatus,
    invoiceValue: response.Data.InvoiceValue,
    currencySymbol: SAR_SYMBOL,
    paidAmount: response.Data.InvoiceTransactions?.[0]?.TransationValue || 0,
    transactionId: response.Data.InvoiceTransactions?.[0]?.TransactionId || null,
    paymentMethod: response.Data.InvoiceTransactions?.[0]?.PaymentGateway || null,
    customerInfo: {
      name: response.Data.CustomerName,
      email: response.Data.CustomerEmail,
      mobile: response.Data.CustomerMobile
    }
  };
}

// server/storage.ts
var MemStorage = class {
  users;
  properties;
  bookings;
  reviews;
  messages;
  wishlists;
  // Channel Manager Maps
  channelProviders;
  channelCredentials;
  channelListings;
  channelRates;
  channelReservations;
  currentUserId;
  currentPropertyId;
  currentBookingId;
  currentReviewId;
  currentMessageId;
  currentWishlistId;
  currentChannelProviderId;
  currentChannelCredentialId;
  currentChannelListingId;
  currentChannelRateId;
  currentChannelReservationId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.properties = /* @__PURE__ */ new Map();
    this.bookings = /* @__PURE__ */ new Map();
    this.reviews = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.wishlists = /* @__PURE__ */ new Map();
    this.channelProviders = /* @__PURE__ */ new Map();
    this.channelCredentials = /* @__PURE__ */ new Map();
    this.channelListings = /* @__PURE__ */ new Map();
    this.channelRates = /* @__PURE__ */ new Map();
    this.channelReservations = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentMessageId = 1;
    this.currentWishlistId = 1;
    this.currentChannelProviderId = 1;
    this.currentChannelCredentialId = 1;
    this.currentChannelListingId = 1;
    this.currentChannelRateId = 1;
    this.currentChannelReservationId = 1;
    this.initializeDemoData();
  }
  initializeDemoData() {
    const host1 = this.createUser({
      username: "host1",
      password: "password123",
      email: "host1@example.com",
      fullName: "Host User 1",
      isHost: true,
      bio: "I'm a host with multiple properties"
    });
    const guest1 = this.createUser({
      username: "guest1",
      password: "password123",
      email: "guest1@example.com",
      fullName: "Guest User 1",
      isHost: false,
      bio: "I love traveling and staying in unique places"
    });
    const property1 = this.createProperty({
      hostId: host1.id,
      title: "Luxury Marina Apartment with Sea View",
      description: "Beautiful apartment with amazing sea views in Dubai Marina.",
      type: "Apartment",
      address: "123 Marina Street",
      city: "Dubai",
      state: "Dubai",
      country: "UAE",
      zipCode: "12345",
      price: 120,
      cleaningFee: 50,
      serviceFee: 30,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      amenities: ["Pool", "Gym", "Ocean view", "Free parking"],
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ]
    });
    const property2 = this.createProperty({
      hostId: host1.id,
      title: "Beachfront Villa with Private Pool",
      description: "Luxurious villa right on the beach with a private pool.",
      type: "Villa",
      address: "456 Palm Street",
      city: "Dubai",
      state: "Dubai",
      country: "UAE",
      zipCode: "12346",
      price: 450,
      cleaningFee: 100,
      serviceFee: 80,
      bedrooms: 4,
      bathrooms: 4.5,
      maxGuests: 8,
      amenities: ["Private beach", "Private pool", "BBQ area", "24/7 security"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ]
    });
    const property3 = this.createProperty({
      hostId: host1.id,
      title: "Modern Downtown Studio near Burj Khalifa",
      description: "Cozy studio apartment in the heart of downtown Dubai.",
      type: "Studio",
      address: "789 Downtown Street",
      city: "Dubai",
      state: "Dubai",
      country: "UAE",
      zipCode: "12347",
      price: 85,
      cleaningFee: 30,
      serviceFee: 20,
      bedrooms: 0,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["City view", "Gym", "Workspace", "Metro access"],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ]
    });
    this.createReview({
      propertyId: property1.id,
      guestId: guest1.id,
      rating: 5,
      comment: "Amazing apartment with stunning views. Would definitely stay again!"
    });
    this.createReview({
      propertyId: property2.id,
      guestId: guest1.id,
      rating: 5,
      comment: "The villa was absolutely beautiful. Perfect for a family vacation."
    });
    this.createBooking({
      propertyId: property1.id,
      guestId: guest1.id,
      checkIn: /* @__PURE__ */ new Date("2023-10-15"),
      checkOut: /* @__PURE__ */ new Date("2023-10-20"),
      totalPrice: 600,
      numGuests: 2,
      status: "confirmed"
    });
    this.createMessage({
      senderId: guest1.id,
      receiverId: host1.id,
      content: "Hi, I'm interested in booking your property. Is it available next week?"
    });
    this.createWishlist({
      userId: guest1.id,
      propertyId: property2.id
    });
    const airbnbProvider = this.createChannelProvider({
      name: "Airbnb",
      description: "Connect and sync your listings with Airbnb",
      apiEndpoint: "https://api.airbnb.com/v2",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg",
      isActive: true,
      supportEmail: "channelsupport@airbnb.com"
    });
    const bookingProvider = this.createChannelProvider({
      name: "Booking.com",
      description: "Sync your property listings with Booking.com",
      apiEndpoint: "https://distribution-xml.booking.com/json",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png",
      isActive: true,
      supportEmail: "connectivity@booking.com"
    });
    const expadiaProvider = this.createChannelProvider({
      name: "Expedia",
      description: "Connect your properties to the Expedia network",
      apiEndpoint: "https://api.expediapartnercentral.com/v1",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Expedia_2012_logo.svg",
      isActive: true,
      supportEmail: "partnersupport@expedia.com"
    });
    const airbnbCredentials = this.createChannelCredential({
      userId: host1.id,
      providerId: airbnbProvider.id,
      apiKey: "dummy-airbnb-api-key-" + Math.random().toString(36).substring(2, 10),
      apiSecret: "dummy-airbnb-secret-" + Math.random().toString(36).substring(2, 15),
      isVerified: true,
      lastVerifiedAt: /* @__PURE__ */ new Date()
    });
    const bookingCredentials = this.createChannelCredential({
      userId: host1.id,
      providerId: bookingProvider.id,
      apiKey: "dummy-booking-api-key-" + Math.random().toString(36).substring(2, 10),
      apiSecret: "dummy-booking-secret-" + Math.random().toString(36).substring(2, 15),
      isVerified: true,
      lastVerifiedAt: /* @__PURE__ */ new Date()
    });
    const riyadhProperty1 = this.createProperty({
      hostId: host1.id,
      title: "Luxury Apartment in Al Olaya District",
      description: "Modern luxury apartment in the heart of Riyadh's business district. Close to Kingdom Centre, with stunning city views.",
      type: "Apartment",
      address: "123 King Fahd Road",
      city: "Riyadh",
      state: "Riyadh Province",
      country: "Saudi Arabia",
      zipCode: "11564",
      price: 380,
      cleaningFee: 50,
      serviceFee: 40,
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      amenities: ["City view", "Swimming pool", "Gym", "24/7 security", "Free parking", "High-speed WiFi"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ]
    });
    const riyadhProperty2 = this.createProperty({
      hostId: host1.id,
      title: "Traditional Villa in Diplomatic Quarter",
      description: "Experience authentic Saudi hospitality in this spacious villa featuring traditional architecture with modern amenities.",
      type: "Villa",
      address: "56 Diplomatic Quarter",
      city: "Riyadh",
      state: "Riyadh Province",
      country: "Saudi Arabia",
      zipCode: "11693",
      price: 620,
      cleaningFee: 80,
      serviceFee: 70,
      bedrooms: 4,
      bathrooms: 3.5,
      maxGuests: 8,
      amenities: ["Private garden", "Swimming pool", "Majlis", "BBQ area", "Smart home", "Housekeeping"],
      images: [
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ]
    });
    const riyadhProperty3 = this.createProperty({
      hostId: host1.id,
      title: "Modern Studio near King Saud University",
      description: "Cozy studio apartment perfect for business travelers or students visiting KSU. Excellent accessibility to major attractions.",
      type: "Studio",
      address: "78 University Road",
      city: "Riyadh",
      state: "Riyadh Province",
      country: "Saudi Arabia",
      zipCode: "11451",
      price: 180,
      cleaningFee: 30,
      serviceFee: 25,
      bedrooms: 0,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ["Study desk", "High-speed WiFi", "Smart TV", "Kitchenette", "Laundry", "24/7 security"],
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      ]
    });
    const airbnbListing1 = this.createChannelListing({
      propertyId: property1.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-listing-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/12345678",
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      basePrice: 130,
      // Slightly higher than our direct booking price
      minStay: 2,
      isInstantBookable: true
    });
    const bookingListing1 = this.createChannelListing({
      propertyId: property1.id,
      providerId: bookingProvider.id,
      externalListingId: "booking-listing-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.booking.com/hotel/ae/12345678.html",
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      basePrice: 125,
      // Competitive price for Booking.com
      minStay: 1,
      isInstantBookable: true
    });
    const airbnbListing2 = this.createChannelListing({
      propertyId: property2.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-listing-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/87654321",
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      basePrice: 480,
      // Slightly higher than our direct booking price
      minStay: 3,
      isInstantBookable: true
    });
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = /* @__PURE__ */ new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = /* @__PURE__ */ new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.createChannelRate({
      listingId: airbnbListing1.id,
      date: tomorrow,
      price: 135,
      // Weekend rate
      minStay: 2,
      isAvailable: true
    });
    this.createChannelRate({
      listingId: airbnbListing1.id,
      date: nextWeek,
      price: 145,
      // Peak season rate
      minStay: 2,
      isAvailable: true
    });
    this.createChannelRate({
      listingId: airbnbListing1.id,
      date: nextMonth,
      price: 120,
      // Off-season discount
      minStay: 1,
      isAvailable: true
    });
    const checkIn = /* @__PURE__ */ new Date();
    checkIn.setDate(checkIn.getDate() + 14);
    const checkOut = /* @__PURE__ */ new Date();
    checkOut.setDate(checkOut.getDate() + 18);
    this.createChannelReservation({
      listingId: airbnbListing1.id,
      externalReservationId: "airbnb-res-" + Math.random().toString(36).substring(2, 10),
      guestName: "John Smith",
      guestEmail: "john.smith@example.com",
      checkIn,
      checkOut,
      totalPrice: 580,
      status: "confirmed",
      bookingId: null,
      guestPhone: "+1234567890",
      numGuests: 2,
      notes: "Guest is celebrating anniversary"
    });
    const riyadhAirbnbListing1 = this.createChannelListing({
      propertyId: riyadhProperty1.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-riyadh-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/riyadh12345",
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      basePrice: 400,
      // Slightly higher than direct booking
      minStay: 2,
      isInstantBookable: true
    });
    const riyadhBookingListing1 = this.createChannelListing({
      propertyId: riyadhProperty1.id,
      providerId: bookingProvider.id,
      externalListingId: "booking-riyadh-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.booking.com/hotel/sa/riyadh12345.html",
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      basePrice: 390,
      // Competitive price
      minStay: 1,
      isInstantBookable: true
    });
    const riyadhAirbnbListing2 = this.createChannelListing({
      propertyId: riyadhProperty2.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-riyadh-villa-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/riyadh67890",
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      basePrice: 650,
      // Premium pricing
      minStay: 3,
      isInstantBookable: true
    });
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const now = /* @__PURE__ */ new Date();
    const user = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Property operations
  async getProperty(id) {
    return this.properties.get(id);
  }
  async getProperties(filters) {
    let properties2 = Array.from(this.properties.values());
    if (filters) {
      properties2 = properties2.filter((property) => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === "price") {
            return property.price <= value;
          } else if (key === "bedrooms" || key === "bathrooms" || key === "maxGuests") {
            return property[key] >= value;
          } else if (key === "amenities" && Array.isArray(value)) {
            return value.every((amenity) => property.amenities?.includes(amenity));
          } else if (key === "type" || key === "city" || key === "country") {
            return property[key] === value;
          }
          return true;
        });
      });
    }
    return properties2;
  }
  async getPropertiesByHost(hostId) {
    return Array.from(this.properties.values()).filter(
      (property) => property.hostId === hostId
    );
  }
  async createProperty(insertProperty) {
    const id = this.currentPropertyId++;
    const now = /* @__PURE__ */ new Date();
    const property = { ...insertProperty, id, createdAt: now };
    this.properties.set(id, property);
    return property;
  }
  async updateProperty(id, propertyData) {
    const property = this.properties.get(id);
    if (!property) return void 0;
    const updatedProperty = { ...property, ...propertyData };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  async deleteProperty(id) {
    return this.properties.delete(id);
  }
  // Booking operations
  async getBooking(id) {
    return this.bookings.get(id);
  }
  async getBookingsByProperty(propertyId) {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.propertyId === propertyId
    );
  }
  async getBookingsByGuest(guestId) {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.guestId === guestId
    );
  }
  async createBooking(insertBooking) {
    const id = this.currentBookingId++;
    const now = /* @__PURE__ */ new Date();
    const booking = { ...insertBooking, id, createdAt: now };
    this.bookings.set(id, booking);
    return booking;
  }
  async updateBooking(id, bookingData) {
    const booking = this.bookings.get(id);
    if (!booking) return void 0;
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  // Review operations
  async getReview(id) {
    return this.reviews.get(id);
  }
  async getReviewsByProperty(propertyId) {
    return Array.from(this.reviews.values()).filter(
      (review) => review.propertyId === propertyId
    );
  }
  async getReviewsByGuest(guestId) {
    return Array.from(this.reviews.values()).filter(
      (review) => review.guestId === guestId
    );
  }
  async createReview(insertReview) {
    const id = this.currentReviewId++;
    const now = /* @__PURE__ */ new Date();
    const review = { ...insertReview, id, createdAt: now };
    this.reviews.set(id, review);
    return review;
  }
  // Message operations
  async getMessage(id) {
    return this.messages.get(id);
  }
  async getMessagesBetweenUsers(userId1, userId2) {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId1 && message.receiverId === userId2 || message.senderId === userId2 && message.receiverId === userId1
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async getUserConversations(userId) {
    const userMessages = Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
    const conversationPartners = /* @__PURE__ */ new Map();
    userMessages.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, { messages: [], userId: partnerId });
      }
      conversationPartners.get(partnerId).messages.push(message);
    });
    const conversations = [];
    for (const [, data] of conversationPartners) {
      const partner = await this.getUser(data.userId);
      if (partner) {
        const sortedMessages = data.messages.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        if (sortedMessages.length > 0) {
          conversations.push({
            user: partner,
            lastMessage: sortedMessages[0]
          });
        }
      }
    }
    return conversations;
  }
  async createMessage(insertMessage) {
    const id = this.currentMessageId++;
    const now = /* @__PURE__ */ new Date();
    const message = { ...insertMessage, id, isRead: false, createdAt: now };
    this.messages.set(id, message);
    return message;
  }
  async markMessageAsRead(id) {
    const message = this.messages.get(id);
    if (!message) return void 0;
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  // Wishlist operations
  async getWishlist(id) {
    return this.wishlists.get(id);
  }
  async getWishlistsByUser(userId) {
    const userWishlists = Array.from(this.wishlists.values()).filter(
      (wishlist) => wishlist.userId === userId
    );
    const wishlistItems = [];
    for (const wishlist of userWishlists) {
      const property = await this.getProperty(wishlist.propertyId);
      if (property) {
        wishlistItems.push({ wishlist, property });
      }
    }
    return wishlistItems;
  }
  async createWishlist(insertWishlist) {
    const existing = Array.from(this.wishlists.values()).find(
      (w) => w.userId === insertWishlist.userId && w.propertyId === insertWishlist.propertyId
    );
    if (existing) {
      return existing;
    }
    const id = this.currentWishlistId++;
    const now = /* @__PURE__ */ new Date();
    const wishlist = { ...insertWishlist, id, createdAt: now };
    this.wishlists.set(id, wishlist);
    return wishlist;
  }
  async deleteWishlist(id) {
    return this.wishlists.delete(id);
  }
  async isPropertyInWishlist(userId, propertyId) {
    return Array.from(this.wishlists.values()).some(
      (wishlist) => wishlist.userId === userId && wishlist.propertyId === propertyId
    );
  }
  // Channel Provider operations
  async getChannelProvider(id) {
    return this.channelProviders.get(id);
  }
  async getChannelProviders(isActive) {
    let providers = Array.from(this.channelProviders.values());
    if (isActive !== void 0) {
      providers = providers.filter((provider) => provider.isActive === isActive);
    }
    return providers;
  }
  async createChannelProvider(provider) {
    const id = this.currentChannelProviderId++;
    const now = /* @__PURE__ */ new Date();
    const channelProvider = { ...provider, id, createdAt: now };
    this.channelProviders.set(id, channelProvider);
    return channelProvider;
  }
  async updateChannelProvider(id, provider) {
    const channelProvider = this.channelProviders.get(id);
    if (!channelProvider) return void 0;
    const updatedProvider = { ...channelProvider, ...provider };
    this.channelProviders.set(id, updatedProvider);
    return updatedProvider;
  }
  async deleteChannelProvider(id) {
    return this.channelProviders.delete(id);
  }
  // Channel Credentials operations
  async getChannelCredential(id) {
    return this.channelCredentials.get(id);
  }
  async getChannelCredentialsByUser(userId) {
    return Array.from(this.channelCredentials.values()).filter(
      (credential) => credential.userId === userId
    );
  }
  async getChannelCredentialByUserAndProvider(userId, providerId) {
    return Array.from(this.channelCredentials.values()).find(
      (credential) => credential.userId === userId && credential.providerId === providerId
    );
  }
  async createChannelCredential(credential) {
    const id = this.currentChannelCredentialId++;
    const now = /* @__PURE__ */ new Date();
    const channelCredential = {
      ...credential,
      id,
      createdAt: now,
      isVerified: false,
      lastVerifiedAt: null
    };
    this.channelCredentials.set(id, channelCredential);
    return channelCredential;
  }
  async updateChannelCredential(id, credential) {
    const channelCredential = this.channelCredentials.get(id);
    if (!channelCredential) return void 0;
    const updatedCredential = { ...channelCredential, ...credential };
    this.channelCredentials.set(id, updatedCredential);
    return updatedCredential;
  }
  async deleteChannelCredential(id) {
    return this.channelCredentials.delete(id);
  }
  async verifyChannelCredential(id) {
    const credential = this.channelCredentials.get(id);
    if (!credential) return void 0;
    const updatedCredential = {
      ...credential,
      isVerified: true,
      lastVerifiedAt: /* @__PURE__ */ new Date()
    };
    this.channelCredentials.set(id, updatedCredential);
    return updatedCredential;
  }
  // Channel Listing operations
  async getChannelListing(id) {
    return this.channelListings.get(id);
  }
  async getChannelListingsByProperty(propertyId) {
    return Array.from(this.channelListings.values()).filter(
      (listing) => listing.propertyId === propertyId
    );
  }
  async getChannelListingsByProvider(providerId) {
    return Array.from(this.channelListings.values()).filter(
      (listing) => listing.providerId === providerId
    );
  }
  async getChannelListingByPropertyAndProvider(propertyId, providerId) {
    return Array.from(this.channelListings.values()).find(
      (listing) => listing.propertyId === propertyId && listing.providerId === providerId
    );
  }
  async createChannelListing(listing) {
    const id = this.currentChannelListingId++;
    const now = /* @__PURE__ */ new Date();
    const channelListing = {
      ...listing,
      id,
      createdAt: now,
      lastSyncedAt: now
    };
    this.channelListings.set(id, channelListing);
    return channelListing;
  }
  async updateChannelListing(id, listing) {
    const channelListing = this.channelListings.get(id);
    if (!channelListing) return void 0;
    const updatedListing = { ...channelListing, ...listing };
    this.channelListings.set(id, updatedListing);
    return updatedListing;
  }
  async deleteChannelListing(id) {
    return this.channelListings.delete(id);
  }
  async syncChannelListing(id) {
    const listing = this.channelListings.get(id);
    if (!listing) return void 0;
    const updatedListing = {
      ...listing,
      lastSyncedAt: /* @__PURE__ */ new Date()
    };
    this.channelListings.set(id, updatedListing);
    return updatedListing;
  }
  // Channel Rate operations
  async getChannelRate(id) {
    return this.channelRates.get(id);
  }
  async getChannelRatesByListing(listingId) {
    return Array.from(this.channelRates.values()).filter(
      (rate) => rate.listingId === listingId
    );
  }
  async getChannelRatesByDateRange(listingId, startDate, endDate) {
    return Array.from(this.channelRates.values()).filter(
      (rate) => {
        const rateDate = new Date(rate.date);
        return rate.listingId === listingId && rateDate >= startDate && rateDate <= endDate;
      }
    );
  }
  async createChannelRate(rate) {
    const id = this.currentChannelRateId++;
    const now = /* @__PURE__ */ new Date();
    const channelRate = {
      ...rate,
      id,
      createdAt: now
    };
    this.channelRates.set(id, channelRate);
    return channelRate;
  }
  async updateChannelRate(id, rate) {
    const channelRate = this.channelRates.get(id);
    if (!channelRate) return void 0;
    const updatedRate = { ...channelRate, ...rate };
    this.channelRates.set(id, updatedRate);
    return updatedRate;
  }
  async deleteChannelRate(id) {
    return this.channelRates.delete(id);
  }
  // Channel Reservation operations
  async getChannelReservation(id) {
    return this.channelReservations.get(id);
  }
  async getChannelReservationsByListing(listingId) {
    return Array.from(this.channelReservations.values()).filter(
      (reservation) => reservation.listingId === listingId
    );
  }
  async getChannelReservationByExternalId(externalReservationId) {
    return Array.from(this.channelReservations.values()).find(
      (reservation) => reservation.externalReservationId === externalReservationId
    );
  }
  async createChannelReservation(reservation) {
    const id = this.currentChannelReservationId++;
    const now = /* @__PURE__ */ new Date();
    const channelReservation = {
      ...reservation,
      id,
      createdAt: now
    };
    this.channelReservations.set(id, channelReservation);
    return channelReservation;
  }
  async updateChannelReservation(id, reservation) {
    const channelReservation = this.channelReservations.get(id);
    if (!channelReservation) return void 0;
    const updatedReservation = { ...channelReservation, ...reservation };
    this.channelReservations.set(id, updatedReservation);
    return updatedReservation;
  }
  async linkChannelReservationToBooking(id, bookingId) {
    const reservation = this.channelReservations.get(id);
    if (!reservation) return void 0;
    const booking = this.bookings.get(bookingId);
    if (!booking) return void 0;
    const updatedReservation = {
      ...reservation,
      bookingId
    };
    this.channelReservations.set(id, updatedReservation);
    return updatedReservation;
  }
};
var storage = new MemStorage();

// server/routes.ts
function extractUserPreferences(messages2) {
  const preferences = {
    locations: [],
    priceRange: { min: null, max: null },
    amenities: [],
    propertyTypes: [],
    guestCount: null,
    viewedProperties: [],
    interestedProperties: []
  };
  const userMessages = messages2.filter((msg) => msg.role === "user");
  for (const message of userMessages) {
    const content = message.content.toLowerCase();
    const cities = ["riyadh", "jeddah", "mecca", "medina", "dammam"];
    for (const city of cities) {
      if (content.includes(city) && !preferences.locations.includes(city)) {
        preferences.locations.push(city);
      }
    }
    const priceMatch = content.match(/(?:under|less than|maximum|max) (\d+)/) || content.match(/(\d+) (?:sar|riyal)/i);
    if (priceMatch && priceMatch[1]) {
      preferences.priceRange.max = parseInt(priceMatch[1]);
    }
    const minPriceMatch = content.match(/(?:over|more than|minimum|min) (\d+)/) || content.match(/from (\d+)/i);
    if (minPriceMatch && minPriceMatch[1]) {
      preferences.priceRange.min = parseInt(minPriceMatch[1]);
    }
    const amenities = ["pool", "wifi", "parking", "gym", "balcony", "kitchen", "air conditioning", "tv"];
    for (const amenity of amenities) {
      if (content.includes(amenity) && !preferences.amenities.includes(amenity)) {
        preferences.amenities.push(amenity);
      }
    }
    const propertyTypes = ["apartment", "villa", "house", "condo", "studio"];
    for (const type of propertyTypes) {
      if (content.includes(type) && !preferences.propertyTypes.includes(type)) {
        preferences.propertyTypes.push(type);
      }
    }
    const guestMatch = content.match(/(\d+) (?:guest|people|person|adult)/i);
    if (guestMatch && guestMatch[1]) {
      preferences.guestCount = parseInt(guestMatch[1]);
    }
  }
  return preferences;
}
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const SessionStore = MemoryStore(session);
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "habibistay-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        // 1 week
        secure: process.env.NODE_ENV === "production"
      }
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  const isHost = async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.user.id);
    if (!user || !user.isHost) {
      return res.status(403).json({ message: "Forbidden: Host access required" });
    }
    next();
  };
  app2.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        return res.status(201).json(user);
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot update other users" });
      }
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.get("/api/properties", async (req, res) => {
    try {
      const filters = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.city) filters.city = req.query.city;
      if (req.query.country) filters.country = req.query.country;
      if (req.query.maxPrice) filters.price = parseInt(req.query.maxPrice);
      if (req.query.minBedrooms) filters.bedrooms = parseInt(req.query.minBedrooms);
      if (req.query.minBathrooms) filters.bathrooms = parseInt(req.query.minBathrooms);
      if (req.query.minGuests) filters.maxGuests = parseInt(req.query.minGuests);
      if (req.query.amenities) {
        filters.amenities = req.query.amenities.split(",");
      }
      const properties2 = await storage.getProperties(Object.keys(filters).length > 0 ? filters : void 0);
      res.json(properties2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties" });
    }
  });
  app2.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(parseInt(req.params.id));
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property" });
    }
  });
  app2.post("/api/properties", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        hostId: req.user.id
      });
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data" });
    }
  });
  app2.put("/api/properties/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.json(updatedProperty);
    } catch (error) {
      res.status(500).json({ message: "Error updating property" });
    }
  });
  app2.delete("/api/properties/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const success = await storage.deleteProperty(propertyId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete property" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting property" });
    }
  });
  app2.get("/api/hosts/:id/properties", async (req, res) => {
    try {
      const hostId = parseInt(req.params.id);
      const properties2 = await storage.getPropertiesByHost(hostId);
      res.json(properties2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching host properties" });
    }
  });
  app2.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      let bookings2;
      if (user?.isHost) {
        const hostProperties = await storage.getPropertiesByHost(userId);
        bookings2 = [];
        for (const property of hostProperties) {
          const propertyBookings = await storage.getBookingsByProperty(property.id);
          bookings2.push(...propertyBookings);
        }
      } else {
        bookings2 = await storage.getBookingsByGuest(userId);
      }
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });
  app2.get("/api/properties/:id/bookings", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const bookings2 = await storage.getBookingsByProperty(propertyId);
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property bookings" });
    }
  });
  app2.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        guestId: req.user.id
      });
      const property = await storage.getProperty(bookingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId === req.user.id) {
        return res.status(400).json({ message: "Cannot book your own property" });
      }
      const existingBookings = await storage.getBookingsByProperty(bookingData.propertyId);
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const hasConflict = existingBookings.some((booking2) => {
        const bookingCheckIn = new Date(booking2.checkIn);
        const bookingCheckOut = new Date(booking2.checkOut);
        return checkIn >= bookingCheckIn && checkIn < bookingCheckOut || checkOut > bookingCheckIn && checkOut <= bookingCheckOut || checkIn <= bookingCheckIn && checkOut >= bookingCheckOut;
      });
      if (hasConflict) {
        return res.status(400).json({ message: "Property is unavailable for selected dates" });
      }
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });
  app2.put("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      const property = await storage.getProperty(booking.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (booking.guestId !== req.user.id && property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to update this booking" });
      }
      const updatedBooking = await storage.updateBooking(bookingId, req.body);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error updating booking" });
    }
  });
  app2.get("/api/properties/:id/reviews", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const reviews2 = await storage.getReviewsByProperty(propertyId);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property reviews" });
    }
  });
  app2.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        guestId: req.user.id
      });
      const property = await storage.getProperty(reviewData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      const userBookings = await storage.getBookingsByGuest(req.user.id);
      const hasBooking = userBookings.some(
        (booking) => booking.propertyId === reviewData.propertyId && booking.status === "completed"
      );
      if (!hasBooking) {
        return res.status(403).json({ message: "Can only review properties you have stayed at" });
      }
      const userReviews = await storage.getReviewsByGuest(req.user.id);
      const hasReviewed = userReviews.some((review2) => review2.propertyId === reviewData.propertyId);
      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this property" });
      }
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });
  app2.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });
  app2.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = parseInt(req.params.userId);
      const messages2 = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      for (const message of messages2) {
        if (message.receiverId === currentUserId && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  app2.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      const receiver = await storage.getUser(messageData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });
  app2.get("/api/wishlists", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const wishlists2 = await storage.getWishlistsByUser(userId);
      res.json(wishlists2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching wishlists" });
    }
  });
  app2.post("/api/wishlists", isAuthenticated, async (req, res) => {
    try {
      const wishlistData = insertWishlistSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const property = await storage.getProperty(wishlistData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      const wishlist = await storage.createWishlist(wishlistData);
      res.status(201).json(wishlist);
    } catch (error) {
      res.status(400).json({ message: "Invalid wishlist data" });
    }
  });
  app2.delete("/api/wishlists/:id", isAuthenticated, async (req, res) => {
    try {
      const wishlistId = parseInt(req.params.id);
      const wishlist = await storage.getWishlist(wishlistId);
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      if (wishlist.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not your wishlist" });
      }
      const success = await storage.deleteWishlist(wishlistId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete wishlist" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting wishlist" });
    }
  });
  app2.get("/api/properties/:id/wishlist", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user.id;
      const isInWishlist = await storage.isPropertyInWishlist(userId, propertyId);
      res.json({ isInWishlist });
    } catch (error) {
      res.status(500).json({ message: "Error checking wishlist status" });
    }
  });
  app2.post("/api/payments/create", isAuthenticated, async (req, res) => {
    try {
      const { amount, propertyId, checkIn, checkOut, guests } = req.body;
      if (!amount || !propertyId || !checkIn || !checkOut || !guests) {
        return res.status(400).json({ message: "Missing required payment information" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const payment = await createPayment(amount, {
        propertyId,
        checkIn,
        checkOut,
        guests
      });
      res.json({
        paymentId: payment.paymentId,
        paymentUrl: payment.paymentUrl,
        amount: payment.amount,
        currencySymbol: payment.currencySymbol
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({
        message: "Error creating payment",
        error: error.message
      });
    }
  });
  app2.get("/api/payments/:id/status", isAuthenticated, async (req, res) => {
    try {
      const paymentId = req.params.id;
      const status = await getPaymentStatus(paymentId);
      res.json({
        paymentId: status.paymentId,
        status: status.status,
        invoiceValue: status.invoiceValue,
        paidAmount: status.paidAmount,
        transactionId: status.transactionId,
        paymentMethod: status.paymentMethod,
        currencySymbol: status.currencySymbol
      });
    } catch (error) {
      console.error("Error getting payment status:", error);
      res.status(500).json({
        message: "Error getting payment status",
        error: error.message
      });
    }
  });
  app2.get("/api/payment/callback", async (req, res) => {
    try {
      const paymentId = req.query.paymentId;
      const status = await getPaymentStatus(paymentId);
      if (status.status === "Paid") {
        const bookingDetails = JSON.parse(req.query.UserDefinedField || "{}");
        if (bookingDetails.propertyId) {
          const bookingData = {
            propertyId: parseInt(bookingDetails.propertyId),
            guestId: req.user?.id || bookingDetails.guestId,
            checkIn: new Date(bookingDetails.checkIn),
            checkOut: new Date(bookingDetails.checkOut),
            numGuests: parseInt(bookingDetails.guests),
            totalPrice: status.invoiceValue,
            status: "confirmed",
            paymentId,
            // Renamed from stripePaymentIntentId
            paymentStatus: "paid"
            // Renamed from stripePaymentStatus
          };
          await storage.createBooking(bookingData);
        }
        res.redirect("/booking-success");
      } else {
        res.redirect("/booking-error");
      }
    } catch (error) {
      console.error("Error in payment callback:", error);
      res.redirect("/booking-error");
    }
  });
  app2.get("/api/payment/error", async (req, res) => {
    console.error("Payment error:", req.query);
    res.redirect("/booking-error");
  });
  app2.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { location, budget, guests, amenities, dateRange } = req.body;
      const filters = {};
      if (location) {
      }
      if (budget) {
        filters.price = budget;
      }
      if (guests) {
        filters.maxGuests = guests;
      }
      let properties2 = await storage.getProperties();
      if (location) {
        const searchLocation = location.toLowerCase();
        properties2 = properties2.filter(
          (property) => property.city?.toLowerCase().includes(searchLocation) || property.country?.toLowerCase().includes(searchLocation) || property.address && property.address.toLowerCase().includes(searchLocation)
        );
      }
      if (budget) {
        properties2 = properties2.filter((property) => property.price <= budget);
      }
      if (guests) {
        properties2 = properties2.filter((property) => property.maxGuests >= guests);
      }
      console.log(`Found ${properties2.length} properties matching the criteria`);
      if (properties2.length === 0) {
        properties2 = await storage.getProperties();
      }
      let userPreferences = null;
      if (req.isAuthenticated() && req.user) {
        if (req.body.conversationHistory && Array.isArray(req.body.conversationHistory)) {
          userPreferences = extractUserPreferences(req.body.conversationHistory);
        }
      }
      const recommendations = await generatePropertyRecommendations(
        {
          location,
          budget,
          guests,
          amenities,
          dateRange
        },
        properties2,
        userPreferences || void 0
        // Handle potential null
      );
      res.json({
        success: true,
        recommendations,
        properties: properties2.slice(0, 2)
        // Limit to top 2 properties for better UX
      });
    } catch (error) {
      console.error("Error generating property recommendations:", error);
      res.status(500).json({
        error: "Failed to generate property recommendations",
        message: "We're sorry, but we couldn't generate recommendations at this time. Please try again later."
      });
    }
  });
  app2.post("/api/ai/pricing", async (req, res) => {
    try {
      const { property, market } = req.body;
      if (!property) {
        return res.status(400).json({
          error: "Missing property data",
          message: "Property data is required for pricing recommendations"
        });
      }
      const recommendations = await generatePricingRecommendations(
        property,
        market || { avgPrice: 0, highSeason: false }
      );
      res.json({
        success: true,
        recommendations
      });
    } catch (error) {
      console.error("Error in pricing API:", error.message);
      res.status(500).json({
        error: "Failed to generate pricing recommendations",
        message: "We're sorry, but we couldn't generate pricing recommendations at this time. Please try again later."
      });
    }
  });
  app2.post("/api/ai/assistant/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      let user = null;
      let userPreferences = null;
      if (req.isAuthenticated()) {
        user = req.user;
        if (context?.messages && context.messages.length > 0) {
          userPreferences = extractUserPreferences(context.messages);
        }
      }
      let bookingStep = null;
      let bookingDetails = null;
      let properties2 = [];
      if (context?.bookingDetails) {
        bookingDetails = context.bookingDetails;
        if (bookingDetails.propertyId) {
          const property = await storage.getProperty(bookingDetails.propertyId);
          if (property) {
            properties2 = [property];
          }
        }
        if (bookingDetails.action === "select_property") {
          bookingStep = "date_selection";
        } else if (bookingDetails.action === "select_dates" && bookingDetails.checkIn && !bookingDetails.checkOut) {
          bookingStep = "checkout_date";
        } else if (bookingDetails.action === "select_dates" && bookingDetails.checkIn && bookingDetails.checkOut) {
          bookingStep = "guest_selection";
        } else if (bookingDetails.action === "select_guests" && bookingDetails.guests && bookingDetails.checkIn && bookingDetails.checkOut) {
          const checkIn = new Date(bookingDetails.checkIn);
          const checkOut = new Date(bookingDetails.checkOut);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1e3 * 60 * 60 * 24));
          const property = properties2[0];
          let amount = 0;
          if (property) {
            amount = property.price * nights;
            if (property.cleaningFee) amount += property.cleaningFee;
            if (property.serviceFee) amount += property.serviceFee;
          }
          bookingStep = "booking_summary";
          bookingDetails.amount = amount;
        } else if (bookingDetails.action === "confirm_booking") {
          bookingStep = "payment_selection";
        } else if (bookingDetails.action === "select_payment") {
          try {
            const property = properties2[0];
            const paymentData = {
              propertyId: property.id,
              propertyTitle: property.title,
              checkIn: bookingDetails.checkIn,
              checkOut: bookingDetails.checkOut,
              guests: bookingDetails.guests
            };
            const payment = await createPayment(bookingDetails.amount, paymentData);
            bookingDetails.paymentId = payment.paymentId;
            if (user && bookingDetails.propertyId) {
              const property2 = properties2[0];
              if (property2) {
                await storage.createBooking({
                  propertyId: property2.id,
                  guestId: user.id,
                  checkIn: new Date(bookingDetails.checkIn),
                  checkOut: new Date(bookingDetails.checkOut),
                  numGuests: bookingDetails.guests,
                  totalPrice: bookingDetails.amount,
                  status: "pending",
                  paymentId: payment.paymentId,
                  // Renamed from stripePaymentIntentId
                  paymentStatus: "processing"
                  // Renamed from stripePaymentStatus
                });
              }
            }
            bookingStep = "confirmation";
          } catch (error) {
            console.error("Payment creation error:", error);
            return res.status(500).json({
              error: "Payment processing error",
              message: "I'm sorry, there was an error processing your payment. Please try again later."
            });
          }
        }
      }
      if (!properties2.length && !bookingStep && (message.toLowerCase().includes("find") || message.toLowerCase().includes("look") || message.toLowerCase().includes("search"))) {
        const filters = {};
        const lowercaseMessage = message.toLowerCase();
        if (lowercaseMessage.includes("bedroom")) {
          const bedroomMatch = lowercaseMessage.match(/(\d+)\s+bedroom/);
          if (bedroomMatch && bedroomMatch[1]) {
            filters.minBedrooms = parseInt(bedroomMatch[1]);
          }
        }
        if (lowercaseMessage.includes("bathroom")) {
          const bathroomMatch = lowercaseMessage.match(/(\d+)\s+bathroom/);
          if (bathroomMatch && bathroomMatch[1]) {
            filters.minBathrooms = parseInt(bathroomMatch[1]);
          }
        }
        const cities = ["riyadh", "jeddah", "mecca", "medina", "dammam"];
        for (const city of cities) {
          if (lowercaseMessage.includes(city)) {
            filters.city = city.charAt(0).toUpperCase() + city.slice(1);
            break;
          }
        }
        properties2 = await storage.getProperties(filters);
        properties2 = properties2.slice(0, 2);
      }
      const aiResponse = await generateBookingAssistantResponse(
        message,
        context?.messages || [],
        user ? {
          id: user.id,
          name: user.fullName
        } : null,
        properties2,
        bookingStep || void 0,
        // Handle potential null
        bookingDetails,
        userPreferences
      );
      res.json({
        message: aiResponse.message,
        properties: properties2.length ? properties2 : void 0,
        options: aiResponse.options,
        bookingStep,
        bookingDetails,
        suggestedFollowUps: aiResponse.suggestedFollowUps,
        conversationContext: aiResponse.conversationContext
      });
    } catch (error) {
      console.error("AI Assistant error:", error);
      res.status(500).json({
        error: "Server error processing AI Assistant request",
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
      });
    }
  });
  app2.get("/api/sara/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const userIdFromQuery = req.query.userId ? parseInt(req.query.userId) : void 0;
      if (userIdFromQuery && userIdFromQuery !== userId) {
        return res.status(403).json({ message: "You can only access your own conversations" });
      }
      const [conversation] = await db.select().from(saraConversations).where(eq(saraConversations.userId, userId)).orderBy(desc(saraConversations.id)).limit(1);
      if (!conversation) {
        return res.status(404).json({ message: "No conversations found" });
      }
      const messages2 = await db.select().from(saraMessages).where(eq(saraMessages.conversationId, conversation.conversationId)).orderBy(asc(saraMessages.id));
      res.json({ conversation, messages: messages2 });
    } catch (error) {
      console.error("Error retrieving SARA conversation:", error);
      res.status(500).json({ message: "Error retrieving SARA conversation" });
    }
  });
  app2.post("/api/sara/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId, messages: messages2 } = req.body;
      if (!messages2 || !Array.isArray(messages2) || messages2.length === 0) {
        return res.status(400).json({ message: "Messages are required" });
      }
      const [existingConversation] = await db.select().from(saraConversations).where(
        and(
          eq(saraConversations.userId, userId),
          eq(saraConversations.conversationId, conversationId)
        )
      );
      if (existingConversation) {
        await db.delete(saraMessages).where(eq(saraMessages.conversationId, conversationId));
      } else {
        await db.insert(saraConversations).values({
          userId,
          conversationId,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
      }
      for (const message of messages2) {
        await db.insert(saraMessages).values({
          conversationId,
          role: message.sender === "user" ? "user" : "assistant",
          content: message.content,
          timestamp: new Date(message.timestamp)
        });
      }
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving SARA conversation:", error);
      res.status(500).json({ message: "Error saving SARA conversation" });
    }
  });
  app2.get("/api/channel-providers", async (req, res) => {
    try {
      const isActive = req.query.active === "true" ? true : req.query.active === "false" ? false : void 0;
      const providers = await storage.getChannelProviders(isActive);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel providers" });
    }
  });
  app2.get("/api/channel-providers/:id", async (req, res) => {
    try {
      const provider = await storage.getChannelProvider(parseInt(req.params.id));
      if (!provider) {
        return res.status(404).json({ message: "Channel provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel provider" });
    }
  });
  app2.post("/api/channel-providers", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user || !user.isHost) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const providerData = insertChannelProviderSchema.parse(req.body);
      const provider = await storage.createChannelProvider(providerData);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ message: "Invalid channel provider data" });
    }
  });
  app2.get("/api/channel-credentials", isAuthenticated, isHost, async (req, res) => {
    try {
      const userId = req.user.id;
      const credentials = await storage.getChannelCredentialsByUser(userId);
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel credentials" });
    }
  });
  app2.post("/api/channel-credentials", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialData = insertChannelCredentialsSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const provider = await storage.getChannelProvider(credentialData.providerId);
      if (!provider) {
        return res.status(404).json({ message: "Channel provider not found" });
      }
      const existingCredential = await storage.getChannelCredentialByUserAndProvider(
        req.user.id,
        credentialData.providerId
      );
      if (existingCredential) {
        return res.status(400).json({ message: "Credentials for this provider already exist" });
      }
      const credential = await storage.createChannelCredential(credentialData);
      res.status(201).json(credential);
    } catch (error) {
      res.status(400).json({ message: "Invalid channel credential data" });
    }
  });
  app2.put("/api/channel-credentials/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const credential = await storage.getChannelCredential(credentialId);
      if (!credential) {
        return res.status(404).json({ message: "Channel credential not found" });
      }
      if (credential.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to update this credential" });
      }
      const updatedCredential = await storage.updateChannelCredential(credentialId, req.body);
      res.json(updatedCredential);
    } catch (error) {
      res.status(500).json({ message: "Error updating channel credential" });
    }
  });
  app2.delete("/api/channel-credentials/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const credential = await storage.getChannelCredential(credentialId);
      if (!credential) {
        return res.status(404).json({ message: "Channel credential not found" });
      }
      if (credential.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to delete this credential" });
      }
      const success = await storage.deleteChannelCredential(credentialId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete channel credential" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting channel credential" });
    }
  });
  app2.post("/api/channel-credentials/:id/verify", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const credential = await storage.getChannelCredential(credentialId);
      if (!credential) {
        return res.status(404).json({ message: "Channel credential not found" });
      }
      if (credential.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to verify this credential" });
      }
      const verifiedCredential = await storage.verifyChannelCredential(credentialId);
      res.json(verifiedCredential);
    } catch (error) {
      res.status(500).json({ message: "Error verifying channel credential" });
    }
  });
  app2.get("/api/properties/:id/channel-listings", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const listings = await storage.getChannelListingsByProperty(propertyId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel listings" });
    }
  });
  app2.post("/api/channel-listings", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingData = insertChannelListingSchema.parse(req.body);
      const property = await storage.getProperty(listingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const provider = await storage.getChannelProvider(listingData.providerId);
      if (!provider) {
        return res.status(404).json({ message: "Channel provider not found" });
      }
      const credential = await storage.getChannelCredentialByUserAndProvider(
        req.user.id,
        listingData.providerId
      );
      if (!credential || !credential.isVerified) {
        return res.status(403).json({ message: "You need verified credentials for this provider" });
      }
      const existingListing = await storage.getChannelListingByPropertyAndProvider(
        listingData.propertyId,
        listingData.providerId
      );
      if (existingListing) {
        return res.status(400).json({ message: "Listing for this property and provider already exists" });
      }
      const listing = await storage.createChannelListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      res.status(400).json({ message: "Invalid channel listing data" });
    }
  });
  app2.put("/api/channel-listings/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const updatedListing = await storage.updateChannelListing(listingId, req.body);
      res.json(updatedListing);
    } catch (error) {
      res.status(500).json({ message: "Error updating channel listing" });
    }
  });
  app2.delete("/api/channel-listings/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const success = await storage.deleteChannelListing(listingId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete channel listing" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting channel listing" });
    }
  });
  app2.post("/api/channel-listings/:id/sync", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const syncedListing = await storage.syncChannelListing(listingId);
      res.json(syncedListing);
    } catch (error) {
      res.status(500).json({ message: "Error syncing channel listing" });
    }
  });
  app2.get("/api/channel-listings/:id/rates", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      let rates;
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        rates = await storage.getChannelRatesByDateRange(listingId, startDate, endDate);
      } else {
        rates = await storage.getChannelRatesByListing(listingId);
      }
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel rates" });
    }
  });
  app2.post("/api/channel-rates", isAuthenticated, isHost, async (req, res) => {
    try {
      const rateData = insertChannelRateSchema.parse(req.body);
      const listing = await storage.getChannelListing(rateData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const rate = await storage.createChannelRate(rateData);
      res.status(201).json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid channel rate data" });
    }
  });
  app2.put("/api/channel-rates/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const rateId = parseInt(req.params.id);
      const rate = await storage.getChannelRate(rateId);
      if (!rate) {
        return res.status(404).json({ message: "Channel rate not found" });
      }
      const listing = await storage.getChannelListing(rate.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const updatedRate = await storage.updateChannelRate(rateId, req.body);
      res.json(updatedRate);
    } catch (error) {
      res.status(500).json({ message: "Error updating channel rate" });
    }
  });
  app2.delete("/api/channel-rates/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const rateId = parseInt(req.params.id);
      const rate = await storage.getChannelRate(rateId);
      if (!rate) {
        return res.status(404).json({ message: "Channel rate not found" });
      }
      const listing = await storage.getChannelListing(rate.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const success = await storage.deleteChannelRate(rateId);
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete channel rate" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting channel rate" });
    }
  });
  app2.get("/api/channel-listings/:id/reservations", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const reservations = await storage.getChannelReservationsByListing(listingId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel reservations" });
    }
  });
  app2.post("/api/channel-reservations", isAuthenticated, isHost, async (req, res) => {
    try {
      const reservationData = insertChannelReservationSchema.parse(req.body);
      const listing = await storage.getChannelListing(reservationData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      if (reservationData.externalReservationId) {
        const existingReservation = await storage.getChannelReservationByExternalId(
          reservationData.externalReservationId
        );
        if (existingReservation) {
          return res.status(400).json({ message: "Reservation with this external ID already exists" });
        }
      }
      const reservation = await storage.createChannelReservation(reservationData);
      res.status(201).json(reservation);
    } catch (error) {
      res.status(400).json({ message: "Invalid channel reservation data" });
    }
  });
  app2.post("/api/channel-reservations/:id/link-booking", isAuthenticated, isHost, async (req, res) => {
    try {
      const reservationId = parseInt(req.params.id);
      const reservation = await storage.getChannelReservation(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Channel reservation not found" });
      }
      const listing = await storage.getChannelListing(reservation.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.propertyId !== property.id) {
        return res.status(400).json({ message: "Booking must be for the same property" });
      }
      const linkedReservation = await storage.linkChannelReservationToBooking(
        reservationId,
        parseInt(bookingId)
      );
      res.json(linkedReservation);
    } catch (error) {
      res.status(500).json({ message: "Error linking channel reservation to booking" });
    }
  });
  return httpServer;
}

// server/vite-setup.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createLogger, createServer as createViteServer } from "vite";

// vite.config.ts
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite-setup.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 3e3;
  server.listen({
    port: Number(port),
    host: "127.0.0.1"
    // Use localhost instead of 0.0.0.0 for local development
  }, () => {
    log(`serving on port ${port}`);
  });
})();
