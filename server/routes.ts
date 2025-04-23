import {
  insertBookingSchema, insertChannelCredentialsSchema,
  insertChannelListingSchema, insertChannelProviderSchema, insertChannelRateSchema,
  insertChannelReservationSchema, insertMessageSchema, insertPropertySchema, insertReviewSchema, insertUserSchema, insertWishlistSchema, saraConversations, saraMessages,
  type Property
} from "@shared/schema";
import { type BookingStep } from "@shared/types"; // Import BookingStep
import { and, eq, desc, asc } from "drizzle-orm";
import type { Express, Request, Response } from "express";
import session from "express-session";
import { createServer, type Server } from "http";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import {
  generateBookingAssistantResponse,
  generatePricingRecommendations,
  generatePropertyRecommendations
} from "./ai";
import { db } from "./db";
import {
  createPayment,
  getPaymentStatus
} from "./myfatoorah";
import { storage } from "./storage";

// Function to extract user preferences from conversation history
function extractUserPreferences(messages: { role: string; content: string }[]): Record<string, any> {
  const preferences: Record<string, any> = {
    locations: [],
    priceRange: { min: null, max: null },
    amenities: [],
    propertyTypes: [],
    guestCount: null,
    viewedProperties: [],
    interestedProperties: []
  };

  // Only process user messages
  const userMessages = messages.filter(msg => msg.role === 'user');

  for (const message of userMessages) {
    const content = message.content.toLowerCase();

    // Extract locations
    const cities = ['riyadh', 'jeddah', 'mecca', 'medina', 'dammam'];
    for (const city of cities) {
      if (content.includes(city) && !preferences.locations.includes(city)) {
        preferences.locations.push(city);
      }
    }

    // Extract price range
    const priceMatch = content.match(/(?:under|less than|maximum|max) (\d+)/) ||
      content.match(/(\d+) (?:sar|riyal)/i);
    if (priceMatch && priceMatch[1]) {
      preferences.priceRange.max = parseInt(priceMatch[1]);
    }

    // Extract minimum price
    const minPriceMatch = content.match(/(?:over|more than|minimum|min) (\d+)/) ||
      content.match(/from (\d+)/i);
    if (minPriceMatch && minPriceMatch[1]) {
      preferences.priceRange.min = parseInt(minPriceMatch[1]);
    }

    // Extract amenities
    const amenities = ['pool', 'wifi', 'parking', 'gym', 'balcony', 'kitchen', 'air conditioning', 'tv'];
    for (const amenity of amenities) {
      if (content.includes(amenity) && !preferences.amenities.includes(amenity)) {
        preferences.amenities.push(amenity);
      }
    }

    // Extract property types
    const propertyTypes = ['apartment', 'villa', 'house', 'condo', 'studio'];
    for (const type of propertyTypes) {
      if (content.includes(type) && !preferences.propertyTypes.includes(type)) {
        preferences.propertyTypes.push(type);
      }
    }

    // Extract guest count
    const guestMatch = content.match(/(\d+) (?:guest|people|person|adult)/i);
    if (guestMatch && guestMatch[1]) {
      preferences.guestCount = parseInt(guestMatch[1]);
    }
  }

  return preferences;
}

// BookingStep type is now imported from @shared/types

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up session
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "habibistay-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        secure: process.env.NODE_ENV === "production"
      }
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

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

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Host middleware
  const isHost = async (req: Request, res: Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser((req.user as any).id);
    if (!user || !user.isHost) {
      return res.status(403).json({ message: "Forbidden: Host access required" });
    }

    next();
  };

  // Authentication routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username or email already exists
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

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
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

  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Check if user is updating their own profile
      if ((req.user as any).id !== userId) {
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

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const filters: any = {};

      if (req.query.type) filters.type = req.query.type;
      if (req.query.city) filters.city = req.query.city;
      if (req.query.country) filters.country = req.query.country;
      if (req.query.maxPrice) filters.price = parseInt(req.query.maxPrice as string);
      if (req.query.minBedrooms) filters.bedrooms = parseInt(req.query.minBedrooms as string);
      if (req.query.minBathrooms) filters.bathrooms = parseInt(req.query.minBathrooms as string);
      if (req.query.minGuests) filters.maxGuests = parseInt(req.query.minGuests as string);
      if (req.query.amenities) {
        filters.amenities = (req.query.amenities as string).split(',');
      }

      const properties = await storage.getProperties(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
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

  app.post("/api/properties", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        hostId: (req.user as any).id
      });

      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ message: "Invalid property data" });
    }
  });

  app.put("/api/properties/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if user is the property owner
      if (property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      res.json(updatedProperty);
    } catch (error) {
      res.status(500).json({ message: "Error updating property" });
    }
  });

  app.delete("/api/properties/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if user is the property owner
      if (property.hostId !== (req.user as any).id) {
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

  app.get("/api/hosts/:id/properties", async (req, res) => {
    try {
      const hostId = parseInt(req.params.id);
      const properties = await storage.getPropertiesByHost(hostId);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching host properties" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);

      let bookings;
      if (user?.isHost) {
        // Get bookings for all properties owned by this host
        const hostProperties = await storage.getPropertiesByHost(userId);
        bookings = [];

        for (const property of hostProperties) {
          const propertyBookings = await storage.getBookingsByProperty(property.id);
          bookings.push(...propertyBookings);
        }
      } else {
        // Get bookings made by this guest
        bookings = await storage.getBookingsByGuest(userId);
      }

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings" });
    }
  });

  app.get("/api/properties/:id/bookings", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Only allow property owner to see all bookings
      if (property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const bookings = await storage.getBookingsByProperty(propertyId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property bookings" });
    }
  });

  // Modified Booking route to initiate payment flow
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      // 1. Validate Input Data (propertyId, checkIn, checkOut, numGuests, totalPrice)
      const inputData = insertBookingSchema.pick({
        propertyId: true,
        checkIn: true,
        checkOut: true,
        numGuests: true,
        totalPrice: true,
      }).parse(req.body);

      const guestId = (req.user as any).id;
      const user = await storage.getUser(guestId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 2. Check Property and Availability
      const property = await storage.getProperty(inputData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      if (property.hostId === guestId) {
        return res.status(400).json({ message: "Cannot book your own property" });
      }
      // TODO: Add more robust availability check (consider existing pending/confirmed bookings)
      // For now, assume basic conflict check is sufficient or handled elsewhere

      // 3. Create Pending Booking
      const pendingBookingData = {
        ...inputData,
        guestId: guestId,
        status: "pending" as const, // Explicitly set status
        paymentStatus: "pending" as const,
      };
      const pendingBooking = await storage.createBooking(pendingBookingData);

      // 4. Initiate MyFatoorah Payment
      const paymentMetaData = { // Data to pass to MyFatoorah callback/webhook
        bookingId: pendingBooking.id,
        propertyId: inputData.propertyId,
        guestId: guestId,
      };

      const payment = await createPayment(
        inputData.totalPrice,
        paymentMetaData, // Pass booking ID for callback linking
        user.fullName || 'Guest',
        user.email
      );

      // 5. Update Pending Booking with Payment ID
      await storage.updateBooking(pendingBooking.id, {
        paymentId: payment.paymentId, // Store MyFatoorah InvoiceId
      });

      // 6. Return Payment URL to Frontend
      res.status(201).json({
        message: "Booking pending. Redirecting to payment.",
        paymentUrl: payment.paymentUrl,
        paymentId: payment.paymentId, // MyFatoorah InvoiceId
        bookingId: pendingBooking.id, // Return pending booking ID
      });

    } catch (error: any) {
      console.error("Error creating booking/payment:", error);
      // Attempt to parse Zod errors for better feedback
      if (error.errors) {
        return res.status(400).json({ message: "Invalid booking data", details: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to initiate booking process" });
    }
  });

  app.put("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Only allow guest or property owner to update booking
      const property = await storage.getProperty(booking.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (booking.guestId !== (req.user as any).id && property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to update this booking" });
      }

      const updatedBooking = await storage.updateBooking(bookingId, req.body);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Error updating booking" });
    }
  });

  // Review routes
  app.get("/api/properties/:id/reviews", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        guestId: (req.user as any).id
      });

      // Check if property exists
      const property = await storage.getProperty(reviewData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if user has booked this property
      const userBookings = await storage.getBookingsByGuest((req.user as any).id);
      const hasBooking = userBookings.some(
        booking => booking.propertyId === reviewData.propertyId && booking.status === "completed"
      );

      if (!hasBooking) {
        return res.status(403).json({ message: "Can only review properties you have stayed at" });
      }

      // Check if user has already reviewed this property
      const userReviews = await storage.getReviewsByGuest((req.user as any).id);
      const hasReviewed = userReviews.some(review => review.propertyId === reviewData.propertyId);

      if (hasReviewed) {
        return res.status(400).json({ message: "You have already reviewed this property" });
      }

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Message routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  app.get("/api/messages/:userId", isAuthenticated, async (req, res) => {
    try {
      const currentUserId = (req.user as any).id;
      const otherUserId = parseInt(req.params.userId);

      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);

      // Mark messages as read
      for (const message of messages) {
        if (message.receiverId === currentUserId && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: (req.user as any).id
      });

      // Check if receiver exists
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

  // Wishlist routes
  app.get("/api/wishlists", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const wishlists = await storage.getWishlistsByUser(userId);
      res.json(wishlists);
    } catch (error) {
      res.status(500).json({ message: "Error fetching wishlists" });
    }
  });

  app.post("/api/wishlists", isAuthenticated, async (req, res) => {
    try {
      const wishlistData = insertWishlistSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });

      // Check if property exists
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

  app.delete("/api/wishlists/:id", isAuthenticated, async (req, res) => {
    try {
      const wishlistId = parseInt(req.params.id);
      const wishlist = await storage.getWishlist(wishlistId);

      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }

      // Check if user owns the wishlist
      if (wishlist.userId !== (req.user as any).id) {
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

  app.get("/api/properties/:id/wishlist", isAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      const isInWishlist = await storage.isPropertyInWishlist(userId, propertyId);
      res.json({ isInWishlist });
    } catch (error) {
      res.status(500).json({ message: "Error checking wishlist status" });
    }
  });

  // MyFatoorah payment routes
  app.post("/api/payments/create", isAuthenticated, async (req, res) => {
    try {
      const { amount, propertyId, checkIn, checkOut, guests } = req.body;

      if (!amount || !propertyId || !checkIn || !checkOut || !guests) {
        return res.status(400).json({ message: "Missing required payment information" });
      }

      const user = await storage.getUser((req.user as any).id);
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
    } catch (error: any) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        message: "Error creating payment",
        error: error.message
      });
    }
  });

  app.get("/api/payments/:id/status", isAuthenticated, async (req, res) => {
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
    } catch (error: any) {
      console.error('Error getting payment status:', error);
      res.status(500).json({
        message: "Error getting payment status",
        error: error.message
      });
    }
  });

  // Modified Payment Callback to update existing pending booking
  app.get("/api/payment/callback", async (req, res) => {
    try {
      const paymentId = req.query.paymentId as string; // MyFatoorah returns paymentId
      if (!paymentId) {
        console.error("Payment callback error: Missing paymentId");
        return res.redirect('/booking-error?reason=invalid_callback');
      }

      const paymentStatus = await getPaymentStatus(paymentId);

      // Retrieve booking ID from UserDefinedField (assuming createPayment sends it)
      // IMPORTANT: Adjust parsing based on how UserDefinedField is actually structured by createPayment
      const userDefinedData = JSON.parse(req.query.UserDefinedField as string || '{}');
      const bookingId = userDefinedData?.bookingId;

      if (!bookingId) {
         console.error(`Payment callback error: Missing bookingId in UserDefinedField for paymentId ${paymentId}`);
         // Attempt to find booking by paymentId as a fallback (less reliable if paymentId isn't unique per attempt)
         const booking = await storage.getBookingByPaymentId(paymentId);
         if (!booking) {
            return res.redirect('/booking-error?reason=booking_not_found');
         }
         // If found via fallback, proceed to update status
         if (paymentStatus.status === "Paid") {
            await storage.updateBooking(booking.id, {
              status: "confirmed",
              paymentStatus: "paid",
              // Optionally store transaction ID if available in paymentStatus
              // transactionId: paymentStatus.transactionId
            });
            return res.redirect(`/booking-success?bookingId=${booking.id}`);
         } else {
            await storage.updateBooking(booking.id, {
              status: "failed",
              paymentStatus: "failed",
            });
            return res.redirect(`/booking-error?reason=payment_failed&bookingId=${booking.id}`);
         }
      }

      // Preferred flow: Update booking found via bookingId from UserDefinedField
      if (paymentStatus.status === "Paid") {
        await storage.updateBooking(bookingId, {
          status: "confirmed",
          paymentStatus: "paid",
          // transactionId: paymentStatus.transactionId // Optional
        });
        res.redirect(`/booking-success?bookingId=${bookingId}`);
      } else {
        // Payment failed or has other status
        await storage.updateBooking(bookingId, {
          status: "failed", // Or keep 'pending' depending on desired flow
          paymentStatus: "failed", // Or map MyFatoorah status
        });
        res.redirect(`/booking-error?reason=payment_${paymentStatus.status.toLowerCase()}&bookingId=${bookingId}`);
      }
    } catch (error: any) {
      console.error('Error in payment callback:', error);
      res.redirect('/booking-error?reason=callback_exception');
    }
  });

  app.get("/api/payment/error", async (req, res) => {
    console.error('Payment error:', req.query);
    res.redirect('/booking-error');
  });

  // AI Assistant routes

  // Property recommendations endpoint
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { location, budget, guests, amenities, dateRange } = req.body;

      // Get properties that match basic criteria
      const filters: Record<string, any> = {};

      if (location) {
        // Make location search case-insensitive and fuzzy
        // Check if location matches city or country (case insensitive)
        // We don't use filters for this - we'll filter the results manually
      }

      if (budget) {
        filters.price = budget; // The storage layer handles lte comparison
      }

      if (guests) {
        filters.maxGuests = guests; // The storage layer handles gte comparison
      }

      // Get all properties first
      let properties = await storage.getProperties();

      // Apply manual location filtering if needed (case insensitive)
      if (location) {
        const searchLocation = location.toLowerCase();
        properties = properties.filter(property =>
          property.city?.toLowerCase().includes(searchLocation) ||
          property.country?.toLowerCase().includes(searchLocation) ||
          (property.address && property.address.toLowerCase().includes(searchLocation))
        );
      }

      // Apply budget filter manually if needed
      if (budget) {
        properties = properties.filter(property => property.price <= budget);
      }

      // Apply guest filter manually if needed
      if (guests) {
        properties = properties.filter(property => property.maxGuests >= guests);
      }

      // Log what we found for debugging
      console.log(`Found ${properties.length} properties matching the criteria`);

      // Return at least some properties for testing
      if (properties.length === 0) {
        // If no exact matches, return some properties anyway
        properties = await storage.getProperties();
      }

      // Extract user preferences from request if authenticated
      let userPreferences = null;
      if (req.isAuthenticated() && req.user) {
        // If there's a conversation history in the request, extract preferences
        if (req.body.conversationHistory && Array.isArray(req.body.conversationHistory)) {
          userPreferences = extractUserPreferences(req.body.conversationHistory);
        }
      }

      // Generate AI-powered recommendations
      const recommendations = await generatePropertyRecommendations(
        {
          location,
          budget,
          guests,
          amenities,
          dateRange
        },
        properties,
        userPreferences || undefined // Handle potential null
      );

      res.json({
        success: true,
        recommendations,
        properties: properties.slice(0, 2) // Limit to top 2 properties for better UX
      });
    } catch (error: any) {
      console.error('Error generating property recommendations:', error);
      res.status(500).json({
        error: "Failed to generate property recommendations",
        message: "We're sorry, but we couldn't generate recommendations at this time. Please try again later."
      });
    }
  });

  // AI pricing optimization route
  app.post("/api/ai/pricing", async (req, res) => {
    try {
      const { property, market } = req.body;

      if (!property) {
        return res.status(400).json({
          error: "Missing property data",
          message: "Property data is required for pricing recommendations"
        });
      }

      // Call OpenAI to get pricing recommendations
      const recommendations = await generatePricingRecommendations(
        property,
        market || { avgPrice: 0, highSeason: false }
      );

      // Return pricing recommendations to client
      res.json({
        success: true,
        recommendations
      });
    } catch (error: any) {
      console.error("Error in pricing API:", error.message);
      res.status(500).json({
        error: "Failed to generate pricing recommendations",
        message: "We're sorry, but we couldn't generate pricing recommendations at this time. Please try again later."
      });
    }
  });

  app.post("/api/ai/assistant/chat", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get user
      let user = null;
      let userPreferences = null;
      if (req.isAuthenticated()) {
        user = req.user;

        // Extract user preferences from previous messages if available
        if (context?.messages && context.messages.length > 0) {
          userPreferences = extractUserPreferences(context.messages);
        }
      }

      // Process booking steps if provided in context
      let bookingStep: BookingStep | null = null; // Type bookingStep
      // Check if BookingStep type is recognized:
      // const testStep: BookingStep = 'date_selection';
      let bookingDetails = null;
      let properties: Property[] = []; // Type properties

      if (context?.bookingDetails) {
        bookingDetails = context.bookingDetails;

        // If we have a property ID, get the property details
        if (bookingDetails.propertyId) {
          const property = await storage.getProperty(bookingDetails.propertyId);
          if (property) {
            properties = [property];
          }
        }

        // Determine next booking step
        if (bookingDetails.action === 'select_property') {
          bookingStep = 'date_selection';
        } else if (bookingDetails.action === 'select_dates' && bookingDetails.checkIn && !bookingDetails.checkOut) {
          bookingStep = 'checkout_date';
        } else if (
          bookingDetails.action === 'select_dates' &&
          bookingDetails.checkIn &&
          bookingDetails.checkOut
        ) {
          bookingStep = 'guest_selection';
        } else if (
          bookingDetails.action === 'select_guests' &&
          bookingDetails.guests &&
          bookingDetails.checkIn &&
          bookingDetails.checkOut
        ) {
          // Calculate amount
          const checkIn = new Date(bookingDetails.checkIn);
          const checkOut = new Date(bookingDetails.checkOut);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

          const property = properties[0];
          let amount = 0;

          if (property) {
            amount = property.price * nights;
            if (property.cleaningFee) amount += property.cleaningFee;
            if (property.serviceFee) amount += property.serviceFee;
          }

          bookingStep = 'booking_summary';
          bookingDetails.amount = amount;
        } else if (bookingDetails.action === 'confirm_booking') {
          bookingStep = 'payment_selection';
        } else if (bookingDetails.action === 'select_payment') {
          // Process payment with MyFatoorah
          try {
            // Create a payment for the booking
            const property = properties[0];
            const paymentData = {
              propertyId: property.id,
              propertyTitle: property.title,
              checkIn: bookingDetails.checkIn,
              checkOut: bookingDetails.checkOut,
              guests: bookingDetails.guests
            };

            // Create payment through MyFatoorah
            const payment = await createPayment(bookingDetails.amount, paymentData);

            // Update bookingDetails with payment info
            bookingDetails.paymentId = payment.paymentId;

            // Create the booking if user is authenticated
            if (user && bookingDetails.propertyId) {
              const property = properties[0];

              if (property) {
                await storage.createBooking({
                  propertyId: property.id,
                  guestId: (user as any).id,
                  checkIn: new Date(bookingDetails.checkIn),
                  checkOut: new Date(bookingDetails.checkOut),
                  numGuests: bookingDetails.guests,
                  totalPrice: bookingDetails.amount,
                  status: 'pending',
                  paymentId: payment.paymentId, // Renamed from stripePaymentIntentId
                  paymentStatus: 'processing', // Renamed from stripePaymentStatus
                });
              }
            }

            bookingStep = 'confirmation';
          } catch (error) {
            console.error('Payment creation error:', error);
            return res.status(500).json({
              error: "Payment processing error",
              message: "I'm sorry, there was an error processing your payment. Please try again later."
            });
          }
        }
      }

      // If no specific booking step, search for properties based on message
      if (!properties.length && !bookingStep &&
        (message.toLowerCase().includes('find') ||
          message.toLowerCase().includes('look') ||
          message.toLowerCase().includes('search'))) {

        // Extract potential search terms
        const filters: Record<string, any> = {};

        // Simple keyword extraction
        const lowercaseMessage = message.toLowerCase();

        if (lowercaseMessage.includes('bedroom')) {
          const bedroomMatch = lowercaseMessage.match(/(\d+)\s+bedroom/);
          if (bedroomMatch && bedroomMatch[1]) {
            filters.minBedrooms = parseInt(bedroomMatch[1]);
          }
        }

        if (lowercaseMessage.includes('bathroom')) {
          const bathroomMatch = lowercaseMessage.match(/(\d+)\s+bathroom/);
          if (bathroomMatch && bathroomMatch[1]) {
            filters.minBathrooms = parseInt(bathroomMatch[1]);
          }
        }

        // Try to extract location
        const cities = ['riyadh', 'jeddah', 'mecca', 'medina', 'dammam'];
        for (const city of cities) {
          if (lowercaseMessage.includes(city)) {
            filters.city = city.charAt(0).toUpperCase() + city.slice(1);
            break;
          }
        }

        // Get some properties
        properties = await storage.getProperties(filters);
        properties = properties.slice(0, 2); // Limit to 2 results for better UX
      }

      // Generate AI response
      const aiResponse = await generateBookingAssistantResponse(
        message,
        context?.messages || [],
        user ? {
          id: (user as any).id,
          name: (user as any).fullName,
        } : null,
        properties,
        bookingStep || undefined, // Handle potential null
        bookingDetails,
        userPreferences
      );

      // Return response with appropriate data
      res.json({
        message: aiResponse.message,
        properties: properties.length ? properties : undefined,
        options: aiResponse.options,
        bookingStep,
        bookingDetails,
        suggestedFollowUps: aiResponse.suggestedFollowUps,
        conversationContext: aiResponse.conversationContext
      });
    } catch (error) {
      console.error('AI Assistant error:', error);
      res.status(500).json({
        error: "Server error processing AI Assistant request",
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
      });
    }
  });

  // SARA AI Assistant conversation routes
  app.get("/api/sara/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userIdFromQuery = req.query.userId ? parseInt(req.query.userId as string) : undefined;

      // Make sure the user can only access their own conversations
      if (userIdFromQuery && userIdFromQuery !== userId) {
        return res.status(403).json({ message: "You can only access your own conversations" });
      }

      // Get the most recent conversation for the user
      const [conversation] = await db
        .select()
        .from(saraConversations)
        .where(eq(saraConversations.userId, userId))
        .orderBy(desc(saraConversations.id)) // Use desc()
        .limit(1);

      if (!conversation) {
        return res.status(404).json({ message: "No conversations found" });
      }

      // Get the messages for this conversation
      const messages = await db
        .select()
        .from(saraMessages)
        .where(eq(saraMessages.conversationId, conversation.conversationId))
        .orderBy(asc(saraMessages.id)); // Use asc()

      res.json({ conversation, messages });
    } catch (error) {
      console.error('Error retrieving SARA conversation:', error);
      res.status(500).json({ message: "Error retrieving SARA conversation" });
    }
  });

  app.post("/api/sara/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { conversationId, messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages are required" });
      }

      // First check if the conversation already exists
      const [existingConversation] = await db
        .select()
        .from(saraConversations)
        .where(
          and(
            eq(saraConversations.userId, userId),
            eq(saraConversations.conversationId, conversationId)
          )
        );

      if (existingConversation) {
        // Delete existing messages for this conversation to replace them
        await db
          .delete(saraMessages)
          .where(eq(saraMessages.conversationId, conversationId));
      } else {
        // Create a new conversation
        // Create a new conversation but we don't need the ID
        await db
          .insert(saraConversations)
          .values({
            userId,
            conversationId,
            createdAt: new Date()
          })
          .returning();
      }

      // Insert all messages for this conversation
      for (const message of messages) {
        await db.insert(saraMessages).values({
          conversationId: conversationId,
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.content,
          timestamp: new Date(message.timestamp)
        });
      }

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error saving SARA conversation:', error);
      res.status(500).json({ message: "Error saving SARA conversation" });
    }
  });

  // Channel Manager Routes

  // Channel Provider routes
  app.get("/api/channel-providers", async (req, res) => {
    try {
      const isActive = req.query.active === "true" ? true :
        req.query.active === "false" ? false :
          undefined;

      const providers = await storage.getChannelProviders(isActive);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel providers" });
    }
  });

  app.get("/api/channel-providers/:id", async (req, res) => {
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

  // For admin use only
  app.post("/api/channel-providers", isAuthenticated, async (req, res) => {
    try {
      // Check if admin
      const user = await storage.getUser((req.user as any).id);
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

  // Channel Credentials routes
  app.get("/api/channel-credentials", isAuthenticated, isHost, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const credentials = await storage.getChannelCredentialsByUser(userId);
      res.json(credentials);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel credentials" });
    }
  });

  app.post("/api/channel-credentials", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialData = insertChannelCredentialsSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });

      // Check if provider exists
      const provider = await storage.getChannelProvider(credentialData.providerId);
      if (!provider) {
        return res.status(404).json({ message: "Channel provider not found" });
      }

      // Check if credential already exists for this provider and user
      const existingCredential = await storage.getChannelCredentialByUserAndProvider(
        (req.user as any).id,
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

  app.put("/api/channel-credentials/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const credential = await storage.getChannelCredential(credentialId);

      if (!credential) {
        return res.status(404).json({ message: "Channel credential not found" });
      }

      // Check if user owns the credential
      if (credential.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to update this credential" });
      }

      const updatedCredential = await storage.updateChannelCredential(credentialId, req.body);
      res.json(updatedCredential);
    } catch (error) {
      res.status(500).json({ message: "Error updating channel credential" });
    }
  });

  app.delete("/api/channel-credentials/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const credential = await storage.getChannelCredential(credentialId);

      if (!credential) {
        return res.status(404).json({ message: "Channel credential not found" });
      }

      // Check if user owns the credential
      if (credential.userId !== (req.user as any).id) {
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

  app.post("/api/channel-credentials/:id/verify", isAuthenticated, isHost, async (req, res) => {
    try {
      const credentialId = parseInt(req.params.id);
      const credential = await storage.getChannelCredential(credentialId);

      if (!credential) {
        return res.status(404).json({ message: "Channel credential not found" });
      }

      // Check if user owns the credential
      if (credential.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not authorized to verify this credential" });
      }

      // In a real application, we would verify the credential with the external provider API
      // For now, we'll simulate a successful verification
      const verifiedCredential = await storage.verifyChannelCredential(credentialId);
      res.json(verifiedCredential);
    } catch (error) {
      res.status(500).json({ message: "Error verifying channel credential" });
    }
  });

  // Channel Listing routes
  app.get("/api/properties/:id/channel-listings", isAuthenticated, isHost, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if user is the property owner
      if (property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const listings = await storage.getChannelListingsByProperty(propertyId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel listings" });
    }
  });

  app.post("/api/channel-listings", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingData = insertChannelListingSchema.parse(req.body);

      // Check if property exists and user is the owner
      const property = await storage.getProperty(listingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      // Check if provider exists
      const provider = await storage.getChannelProvider(listingData.providerId);
      if (!provider) {
        return res.status(404).json({ message: "Channel provider not found" });
      }

      // Check if user has credentials for this provider
      const credential = await storage.getChannelCredentialByUserAndProvider(
        (req.user as any).id,
        listingData.providerId
      );

      if (!credential || !credential.isVerified) {
        return res.status(403).json({ message: "You need verified credentials for this provider" });
      }

      // Check if listing already exists for this property and provider
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

  app.put("/api/channel-listings/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);

      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      // Check if user is the property owner
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const updatedListing = await storage.updateChannelListing(listingId, req.body);
      res.json(updatedListing);
    } catch (error) {
      res.status(500).json({ message: "Error updating channel listing" });
    }
  });

  app.delete("/api/channel-listings/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);

      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      // Check if user is the property owner
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
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

  app.post("/api/channel-listings/:id/sync", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);

      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      // Check if user is the property owner
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      // In a real application, we would sync with the external provider API
      // For now, we'll simulate a successful sync
      const syncedListing = await storage.syncChannelListing(listingId);
      res.json(syncedListing);
    } catch (error) {
      res.status(500).json({ message: "Error syncing channel listing" });
    }
  });

  // Channel Rate routes
  app.get("/api/channel-listings/:id/rates", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);

      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      // Check if user is the property owner
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      // Check for date range filter
      let rates;
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        rates = await storage.getChannelRatesByDateRange(listingId, startDate, endDate);
      } else {
        rates = await storage.getChannelRatesByListing(listingId);
      }

      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel rates" });
    }
  });

  app.post("/api/channel-rates", isAuthenticated, isHost, async (req, res) => {
    try {
      const rateData = insertChannelRateSchema.parse(req.body);

      // Check if listing exists and user is the property owner
      const listing = await storage.getChannelListing(rateData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const rate = await storage.createChannelRate(rateData);
      res.status(201).json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid channel rate data" });
    }
  });

  app.put("/api/channel-rates/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const rateId = parseInt(req.params.id);
      const rate = await storage.getChannelRate(rateId);

      if (!rate) {
        return res.status(404).json({ message: "Channel rate not found" });
      }

      // Check if user is the property owner
      const listing = await storage.getChannelListing(rate.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const updatedRate = await storage.updateChannelRate(rateId, req.body);
      res.json(updatedRate);
    } catch (error) {
      res.status(500).json({ message: "Error updating channel rate" });
    }
  });

  app.delete("/api/channel-rates/:id", isAuthenticated, isHost, async (req, res) => {
    try {
      const rateId = parseInt(req.params.id);
      const rate = await storage.getChannelRate(rateId);

      if (!rate) {
        return res.status(404).json({ message: "Channel rate not found" });
      }

      // Check if user is the property owner
      const listing = await storage.getChannelListing(rate.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
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

  // Channel Reservation routes
  app.get("/api/channel-listings/:id/reservations", isAuthenticated, isHost, async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const listing = await storage.getChannelListing(listingId);

      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      // Check if user is the property owner
      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      const reservations = await storage.getChannelReservationsByListing(listingId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching channel reservations" });
    }
  });

  app.post("/api/channel-reservations", isAuthenticated, isHost, async (req, res) => {
    try {
      const reservationData = insertChannelReservationSchema.parse(req.body);

      // Check if listing exists and user is the property owner
      const listing = await storage.getChannelListing(reservationData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      // Check if reservation already exists with the same external ID
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

  app.post("/api/channel-reservations/:id/link-booking", isAuthenticated, isHost, async (req, res) => {
    try {
      const reservationId = parseInt(req.params.id);
      const reservation = await storage.getChannelReservation(reservationId);

      if (!reservation) {
        return res.status(404).json({ message: "Channel reservation not found" });
      }

      // Check if user is the property owner
      const listing = await storage.getChannelListing(reservation.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Channel listing not found" });
      }

      const property = await storage.getProperty(listing.propertyId);
      if (!property || property.hostId !== (req.user as any).id) {
        return res.status(403).json({ message: "Forbidden: Not the property owner" });
      }

      // Get booking ID from request
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required" });
      }

      // Check if booking exists
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if booking is for the same property
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
