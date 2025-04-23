import {
  users, properties, bookings, reviews, messages, wishlists,
  channelProviders, channelCredentials, channelListings, channelRates, channelReservations,
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Booking, type InsertBooking,
  type Review, type InsertReview,
  type Message, type InsertMessage,
  type Wishlist, type InsertWishlist,
  type ChannelProvider, type InsertChannelProvider,
  type ChannelCredential, type InsertChannelCredential,
  type ChannelListing, type InsertChannelListing,
  type ChannelRate, type InsertChannelRate,
  type ChannelReservation, type InsertChannelReservation
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Property operations
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(filters?: Partial<Property>): Promise<Property[]>;
  getPropertiesByHost(hostId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  getBookingsByGuest(guestId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  getBookingByPaymentId(paymentId: string): Promise<Booking | undefined>;

  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByProperty(propertyId: number): Promise<Review[]>;
  getReviewsByGuest(guestId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getUserConversations(userId: number): Promise<Array<{ user: User, lastMessage: Message }>>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  // Wishlist operations
  getWishlist(id: number): Promise<Wishlist | undefined>;
  getWishlistsByUser(userId: number): Promise<{ wishlist: Wishlist, property: Property }[]>;
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  deleteWishlist(id: number): Promise<boolean>;
  isPropertyInWishlist(userId: number, propertyId: number): Promise<boolean>;

  // Channel Provider operations
  getChannelProvider(id: number): Promise<ChannelProvider | undefined>;
  getChannelProviders(isActive?: boolean): Promise<ChannelProvider[]>;
  createChannelProvider(provider: InsertChannelProvider): Promise<ChannelProvider>;
  updateChannelProvider(id: number, provider: Partial<ChannelProvider>): Promise<ChannelProvider | undefined>;
  deleteChannelProvider(id: number): Promise<boolean>;

  // Channel Credentials operations
  getChannelCredential(id: number): Promise<ChannelCredential | undefined>;
  getChannelCredentialsByUser(userId: number): Promise<ChannelCredential[]>;
  getChannelCredentialByUserAndProvider(userId: number, providerId: number): Promise<ChannelCredential | undefined>;
  createChannelCredential(credential: InsertChannelCredential): Promise<ChannelCredential>;
  updateChannelCredential(id: number, credential: Partial<ChannelCredential>): Promise<ChannelCredential | undefined>;
  deleteChannelCredential(id: number): Promise<boolean>;
  verifyChannelCredential(id: number): Promise<ChannelCredential | undefined>;

  // Channel Listing operations
  getChannelListing(id: number): Promise<ChannelListing | undefined>;
  getChannelListingsByProperty(propertyId: number): Promise<ChannelListing[]>;
  getChannelListingsByProvider(providerId: number): Promise<ChannelListing[]>;
  getChannelListingByPropertyAndProvider(propertyId: number, providerId: number): Promise<ChannelListing | undefined>;
  createChannelListing(listing: InsertChannelListing): Promise<ChannelListing>;
  updateChannelListing(id: number, listing: Partial<ChannelListing>): Promise<ChannelListing | undefined>;
  deleteChannelListing(id: number): Promise<boolean>;
  syncChannelListing(id: number): Promise<ChannelListing | undefined>;

  // Channel Rate operations
  getChannelRate(id: number): Promise<ChannelRate | undefined>;
  getChannelRatesByListing(listingId: number): Promise<ChannelRate[]>;
  getChannelRatesByDateRange(listingId: number, startDate: Date, endDate: Date): Promise<ChannelRate[]>;
  createChannelRate(rate: InsertChannelRate): Promise<ChannelRate>;
  updateChannelRate(id: number, rate: Partial<ChannelRate>): Promise<ChannelRate | undefined>;
  deleteChannelRate(id: number): Promise<boolean>;

  // Channel Reservation operations
  getChannelReservation(id: number): Promise<ChannelReservation | undefined>;
  getChannelReservationsByListing(listingId: number): Promise<ChannelReservation[]>;
  getChannelReservationByExternalId(externalReservationId: string): Promise<ChannelReservation | undefined>;
  createChannelReservation(reservation: InsertChannelReservation): Promise<ChannelReservation>;
  updateChannelReservation(id: number, reservation: Partial<ChannelReservation>): Promise<ChannelReservation | undefined>;
  linkChannelReservationToBooking(id: number, bookingId: number): Promise<ChannelReservation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  private wishlists: Map<number, Wishlist>;

  // Channel Manager Maps
  private channelProviders: Map<number, ChannelProvider>;
  private channelCredentials: Map<number, ChannelCredential>;
  private channelListings: Map<number, ChannelListing>;
  private channelRates: Map<number, ChannelRate>;
  private channelReservations: Map<number, ChannelReservation>;

  private currentUserId: number;
  private currentPropertyId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentMessageId: number;
  private currentWishlistId: number;
  private currentChannelProviderId: number;
  private currentChannelCredentialId: number;
  private currentChannelListingId: number;
  private currentChannelRateId: number;
  private currentChannelReservationId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    this.wishlists = new Map();

    // Initialize channel manager maps
    this.channelProviders = new Map();
    this.channelCredentials = new Map();
    this.channelListings = new Map();
    this.channelRates = new Map();
    this.channelReservations = new Map();

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

    // Add demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() { // Made async
    // Create some demo users
    const host1 = await this.createUser({ // Await call
      username: "host1",
      password: "password123",
      email: "host1@example.com",
      fullName: "Host User 1",
      isHost: true,
      bio: "I'm a host with multiple properties",
      profileImage: null, // Added missing nullable property
      myfatoorahCustomerId: null // Added missing nullable property
    });

    const guest1 = await this.createUser({ // Await call
      username: "guest1",
      password: "password123",
      email: "guest1@example.com",
      fullName: "Guest User 1",
      isHost: false,
      bio: "I love traveling and staying in unique places",
      profileImage: null, // Added missing nullable property
      myfatoorahCustomerId: null // Added missing nullable property
    });

    // Create some demo properties
    const property1 = await this.createProperty({ // Await call
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
        { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" } // Corrected image format
      ],
      rating: null, // Added missing nullable property
      reviewCount: 0, // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date() // Added missing property
    });

    const property2 = await this.createProperty({ // Await call
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
        { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" } // Corrected image format
      ],
      rating: null, // Added missing nullable property
      reviewCount: 0, // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date() // Added missing property
    });

    const property3 = await this.createProperty({ // Await call
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
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" } // Corrected image format
      ],
      rating: null, // Added missing nullable property
      reviewCount: 0, // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date() // Added missing property
    });

    // Add some reviews
    await this.createReview({ // Await call
      propertyId: property1.id,
      guestId: guest1.id,
      rating: 5,
      comment: "Amazing apartment with stunning views. Would definitely stay again!"
    });

    await this.createReview({ // Await call
      propertyId: property2.id,
      guestId: guest1.id,
      rating: 5,
      comment: "The villa was absolutely beautiful. Perfect for a family vacation."
    });

    // Add a booking
    await this.createBooking({ // Await call
      propertyId: property1.id,
      guestId: guest1.id,
      checkIn: new Date("2023-10-15"),
      checkOut: new Date("2023-10-20"),
      totalPrice: 600,
      numGuests: 2,
      status: "confirmed",
      paymentId: null, // Added missing nullable property
      paymentStatus: null // Added missing nullable property
    });

    // Add a message
    await this.createMessage({ // Await call
      senderId: guest1.id,
      receiverId: host1.id,
      content: "Hi, I'm interested in booking your property. Is it available next week?"
    });

    // Add a wishlist entry
    await this.createWishlist({ // Await call
      userId: guest1.id,
      propertyId: property2.id
    });

    // Add channel providers
    const airbnbProvider = await this.createChannelProvider({ // Await call
      name: "Airbnb",
      slug: "airbnb", // Added missing property
      apiEndpoint: "https://api.airbnb.com/v2",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg",
      isActive: true,
      // description: "Connect and sync your listings with Airbnb", // Removed extra property
      // supportEmail: "channelsupport@airbnb.com", // Removed extra property
      updatedAt: new Date() // Added missing property
    });

    const bookingProvider = await this.createChannelProvider({ // Await call
      name: "Booking.com",
      slug: "booking", // Added missing property
      apiEndpoint: "https://distribution-xml.booking.com/json",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/2560px-Booking.com_logo.svg.png",
      isActive: true,
      // description: "Sync your property listings with Booking.com", // Removed extra property
      // supportEmail: "connectivity@booking.com", // Removed extra property
      updatedAt: new Date() // Added missing property
    });

    const expadiaProvider = await this.createChannelProvider({ // Await call
      name: "Expedia",
      slug: "expedia", // Added missing property
      apiEndpoint: "https://api.expediapartnercentral.com/v1",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Expedia_2012_logo.svg",
      isActive: true,
      // description: "Connect your properties to the Expedia network", // Removed extra property
      // supportEmail: "partnersupport@expedia.com", // Removed extra property
      updatedAt: new Date() // Added missing property
    });

    // Add channel credentials for the host
    const airbnbCredentials = await this.createChannelCredential({ // Await call
      userId: host1.id,
      providerId: airbnbProvider.id,
      apiKey: "dummy-airbnb-api-key-" + Math.random().toString(36).substring(2, 10),
      apiSecret: "dummy-airbnb-secret-" + Math.random().toString(36).substring(2, 15),
      isVerified: true,
      lastVerifiedAt: new Date(),
      accountId: null, // Added missing nullable property
      refreshToken: null, // Added missing nullable property
      accessToken: null, // Added missing nullable property
      tokenExpiresAt: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    const bookingCredentials = await this.createChannelCredential({ // Await call
      userId: host1.id,
      providerId: bookingProvider.id,
      apiKey: "dummy-booking-api-key-" + Math.random().toString(36).substring(2, 10),
      apiSecret: "dummy-booking-secret-" + Math.random().toString(36).substring(2, 15),
      isVerified: true,
      lastVerifiedAt: new Date(),
      accountId: null, // Added missing nullable property
      refreshToken: null, // Added missing nullable property
      accessToken: null, // Added missing nullable property
      tokenExpiresAt: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    // Add Riyadh-based properties
    const riyadhProperty1 = await this.createProperty({ // Await call
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
        { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }, // Corrected image format
        { url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" } // Corrected image format
      ],
      rating: null, // Added missing nullable property
      reviewCount: 0, // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date() // Added missing property
    });

    const riyadhProperty2 = await this.createProperty({ // Await call
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
        { url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }, // Corrected image format
        { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" } // Corrected image format
      ],
      rating: null, // Added missing nullable property
      reviewCount: 0, // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date() // Added missing property
    });

    const riyadhProperty3 = await this.createProperty({ // Await call
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
        { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }, // Corrected image format
        { url: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" } // Corrected image format
      ],
      rating: null, // Added missing nullable property
      reviewCount: 0, // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date() // Added missing property
    });

    // Create channel listings
    const airbnbListing1 = await this.createChannelListing({ // Await call
      propertyId: property1.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-listing-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/12345678",
      status: "active",
      lastSynced: new Date(), // Corrected property name
      basePrice: 130, // Slightly higher than our direct booking price
      minStay: 2,
      isInstantBookable: true,
      syncErrors: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    const bookingListing1 = await this.createChannelListing({ // Await call
      propertyId: property1.id,
      providerId: bookingProvider.id,
      externalListingId: "booking-listing-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.booking.com/hotel/ae/12345678.html",
      status: "active",
      lastSynced: new Date(), // Corrected property name
      basePrice: 125, // Competitive price for Booking.com
      minStay: 1,
      isInstantBookable: true,
      syncErrors: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    const airbnbListing2 = await this.createChannelListing({ // Await call
      propertyId: property2.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-listing-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/87654321",
      status: "active",
      lastSynced: new Date(), // Corrected property name
      basePrice: 480, // Slightly higher than our direct booking price
      minStay: 3,
      isInstantBookable: true,
      syncErrors: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    // Add some channel rates for different dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Channel rates for Airbnb listing 1
    await this.createChannelRate({ // Await call
      listingId: airbnbListing1.id,
      date: tomorrow,
      price: 135, // Weekend rate
      minStay: 2,
      isClosed: null, // Added missing nullable property
      closedToArrival: null, // Added missing nullable property
      closedToDeparture: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
      // isAvailable: true // Removed extra property
    });

    await this.createChannelRate({ // Await call
      listingId: airbnbListing1.id,
      date: nextWeek,
      price: 145, // Peak season rate
      minStay: 2,
      isClosed: null, // Added missing nullable property
      closedToArrival: null, // Added missing nullable property
      closedToDeparture: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
      // isAvailable: true // Removed extra property
    });

    await this.createChannelRate({ // Await call
      listingId: airbnbListing1.id,
      date: nextMonth,
      price: 120, // Off-season discount
      minStay: 1,
      isClosed: null, // Added missing nullable property
      closedToArrival: null, // Added missing nullable property
      closedToDeparture: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
      // isAvailable: true // Removed extra property
    });

    // Add a channel reservation
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 14);

    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 18); // 4-night stay

    await this.createChannelReservation({ // Await call
      listingId: airbnbListing1.id,
      externalReservationId: "airbnb-res-" + Math.random().toString(36).substring(2, 10),
      guestName: "John Smith",
      guestEmail: "john.smith@example.com",
      checkIn: checkIn,
      checkOut: checkOut,
      totalAmount: 580, // Corrected property name
      status: "confirmed",
      bookingId: null,
      guestPhone: "+1234567890",
      numberOfGuests: 2, // Corrected property name
      guestNotes: "Guest is celebrating anniversary", // Corrected property name
      paymentStatus: "paid", // Added missing property
      updatedAt: new Date() // Added missing property
      // totalPrice: 580, // Removed extra property
      // numGuests: 2, // Removed extra property
      // notes: "Guest is celebrating anniversary" // Removed extra property
    });

    // Add channel listings for Riyadh properties
    const riyadhAirbnbListing1 = await this.createChannelListing({ // Await call
      propertyId: riyadhProperty1.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-riyadh-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/riyadh12345",
      status: "active",
      lastSynced: new Date(), // Corrected property name
      basePrice: 400, // Slightly higher than direct booking
      minStay: 2,
      isInstantBookable: true,
      syncErrors: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    const riyadhBookingListing1 = await this.createChannelListing({ // Await call
      propertyId: riyadhProperty1.id,
      providerId: bookingProvider.id,
      externalListingId: "booking-riyadh-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.booking.com/hotel/sa/riyadh12345.html",
      status: "active",
      lastSynced: new Date(), // Corrected property name
      basePrice: 390, // Competitive price
      minStay: 1,
      isInstantBookable: true,
      syncErrors: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });

    const riyadhAirbnbListing2 = await this.createChannelListing({ // Await call
      propertyId: riyadhProperty2.id,
      providerId: airbnbProvider.id,
      externalListingId: "airbnb-riyadh-villa-" + Math.random().toString(36).substring(2, 10),
      externalListingUrl: "https://www.airbnb.com/rooms/riyadh67890",
      status: "active",
      lastSynced: new Date(), // Corrected property name
      basePrice: 650, // Premium pricing
      minStay: 3,
      isInstantBookable: true,
      syncErrors: null, // Added missing nullable property
      updatedAt: new Date() // Added missing property
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getProperties(filters?: Partial<Property>): Promise<Property[]> {
    let properties = Array.from(this.properties.values());

    if (filters) {
      properties = properties.filter(property => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'price') {
            return property.price !== null && property.price <= (value as number); // Added null check
          } else if (key === 'bedrooms' || key === 'bathrooms' || key === 'maxGuests') {
             // Added null checks and type assertion
            return property[key as keyof Property] !== null && (property[key as keyof Property] as number) >= (value as number);
          } else if (key === 'amenities' && Array.isArray(value)) {
            return value.every(amenity => property.amenities?.includes(amenity));
          } else if (key === 'type' || key === 'city' || key === 'country') {
            return property[key as keyof Property] === value;
          }
          return true;
        });
      });
    }

    return properties;
  }

  async getPropertiesByHost(hostId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.hostId === hostId
    );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const now = new Date();
    const property: Property = { ...insertProperty, id, createdAt: now, updatedAt: now }; // Added updatedAt
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    const updatedProperty = { ...property, ...propertyData, updatedAt: new Date() }; // Update updatedAt
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.propertyId === propertyId
    );
  }

  async getBookingsByGuest(guestId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.guestId === guestId
    );
  }

  async getBookingByPaymentId(paymentId: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.paymentId === paymentId
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt: now, updatedAt: now }; // Added updatedAt
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...bookingData, updatedAt: new Date() }; // Update updatedAt
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.propertyId === propertyId
    );
  }

  async getReviewsByGuest(guestId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.guestId === guestId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { ...insertReview, id, createdAt: now, updatedAt: now }; // Added updatedAt
    this.reviews.set(id, review);
    return review;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) =>
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserConversations(userId: number): Promise<Array<{ user: User, lastMessage: Message }>> {
    const userMessages = Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );

    const conversationPartners = new Map<number, { messages: Message[], userId: number }>();

    userMessages.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;

      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, { messages: [], userId: partnerId });
      }

      conversationPartners.get(partnerId)!.messages.push(message);
    });

    const conversations: Array<{ user: User, lastMessage: Message }> = [];

    for (const [, data] of conversationPartners) {
      const partner = await this.getUser(data.userId);
      if (partner) {
        // Sort messages by date and get the most recent one
        const sortedMessages = data.messages.sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
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

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, isRead: false, createdAt: now, updatedAt: now }; // Added updatedAt
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    const updatedMessage = { ...message, isRead: true, updatedAt: new Date() }; // Update updatedAt
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Wishlist operations
  async getWishlist(id: number): Promise<Wishlist | undefined> {
    return this.wishlists.get(id);
  }

  async getWishlistsByUser(userId: number): Promise<{ wishlist: Wishlist, property: Property }[]> {
    const userWishlists = Array.from(this.wishlists.values()).filter(
      (wishlist) => wishlist.userId === userId
    );

    const wishlistItems: { wishlist: Wishlist, property: Property }[] = [];

    for (const wishlist of userWishlists) {
      const property = await this.getProperty(wishlist.propertyId);
      if (property) {
        wishlistItems.push({ wishlist, property });
      }
    }

    return wishlistItems;
  }

  async createWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    // Check if wishlist already exists for this user and property
    const existing = Array.from(this.wishlists.values()).find(
      w => w.userId === insertWishlist.userId && w.propertyId === insertWishlist.propertyId
    );

    if (existing) {
      return existing;
    }

    const id = this.currentWishlistId++;
    const now = new Date();
    const wishlist: Wishlist = { ...insertWishlist, id, createdAt: now, updatedAt: now }; // Added updatedAt
    this.wishlists.set(id, wishlist);
    return wishlist;
  }

  async deleteWishlist(id: number): Promise<boolean> {
    return this.wishlists.delete(id);
  }

  async isPropertyInWishlist(userId: number, propertyId: number): Promise<boolean> {
    return Array.from(this.wishlists.values()).some(
      wishlist => wishlist.userId === userId && wishlist.propertyId === propertyId
    );
  }

  // Channel Provider operations
  async getChannelProvider(id: number): Promise<ChannelProvider | undefined> {
    return this.channelProviders.get(id);
  }

  async getChannelProviders(isActive?: boolean): Promise<ChannelProvider[]> {
    let providers = Array.from(this.channelProviders.values());
    if (isActive !== undefined) {
      providers = providers.filter(provider => provider.isActive === isActive);
    }
    return providers;
  }

  async createChannelProvider(provider: InsertChannelProvider): Promise<ChannelProvider> {
    const id = this.currentChannelProviderId++;
    const now = new Date();
    const channelProvider: ChannelProvider = { ...provider, id, createdAt: now, updatedAt: now }; // Added updatedAt
    this.channelProviders.set(id, channelProvider);
    return channelProvider;
  }

  async updateChannelProvider(id: number, provider: Partial<ChannelProvider>): Promise<ChannelProvider | undefined> {
    const channelProvider = this.channelProviders.get(id);
    if (!channelProvider) return undefined;

    const updatedProvider = { ...channelProvider, ...provider, updatedAt: new Date() }; // Update updatedAt
    this.channelProviders.set(id, updatedProvider);
    return updatedProvider;
  }

  async deleteChannelProvider(id: number): Promise<boolean> {
    return this.channelProviders.delete(id);
  }

  // Channel Credentials operations
  async getChannelCredential(id: number): Promise<ChannelCredential | undefined> {
    return this.channelCredentials.get(id);
  }

  async getChannelCredentialsByUser(userId: number): Promise<ChannelCredential[]> {
    return Array.from(this.channelCredentials.values()).filter(
      credential => credential.userId === userId
    );
  }

  async getChannelCredentialByUserAndProvider(userId: number, providerId: number): Promise<ChannelCredential | undefined> {
    return Array.from(this.channelCredentials.values()).find(
      credential => credential.userId === userId && credential.providerId === providerId
    );
  }

  async createChannelCredential(credential: InsertChannelCredential): Promise<ChannelCredential> {
    const id = this.currentChannelCredentialId++;
    const now = new Date();
    const channelCredential: ChannelCredential = {
      ...credential,
      id,
      createdAt: now,
      updatedAt: now, // Added missing property
      isVerified: false,
      lastVerifiedAt: null,
      accountId: null, // Ensure nullable properties are present
      refreshToken: null,
      accessToken: null,
      tokenExpiresAt: null,
    };
    this.channelCredentials.set(id, channelCredential);
    return channelCredential;
  }

  async updateChannelCredential(id: number, credential: Partial<ChannelCredential>): Promise<ChannelCredential | undefined> {
    const channelCredential = this.channelCredentials.get(id);
    if (!channelCredential) return undefined;

    const updatedCredential = { ...channelCredential, ...credential, updatedAt: new Date() }; // Update updatedAt
    this.channelCredentials.set(id, updatedCredential);
    return updatedCredential;
  }

  async deleteChannelCredential(id: number): Promise<boolean> {
    return this.channelCredentials.delete(id);
  }

  async verifyChannelCredential(id: number): Promise<ChannelCredential | undefined> {
    const credential = this.channelCredentials.get(id);
    if (!credential) return undefined;

    const updatedCredential = {
      ...credential,
      isVerified: true,
      lastVerifiedAt: new Date(),
      updatedAt: new Date() // Added missing property
    };
    this.channelCredentials.set(id, updatedCredential);
    return updatedCredential;
  }

  // Channel Listing operations
  async getChannelListing(id: number): Promise<ChannelListing | undefined> {
    return this.channelListings.get(id);
  }

  async getChannelListingsByProperty(propertyId: number): Promise<ChannelListing[]> {
    return Array.from(this.channelListings.values()).filter(
      listing => listing.propertyId === propertyId
    );
  }

  async getChannelListingsByProvider(providerId: number): Promise<ChannelListing[]> {
    return Array.from(this.channelListings.values()).filter(
      listing => listing.providerId === providerId
    );
  }

  async getChannelListingByPropertyAndProvider(propertyId: number, providerId: number): Promise<ChannelListing | undefined> {
    return Array.from(this.channelListings.values()).find(
      listing => listing.propertyId === propertyId && listing.providerId === providerId
    );
  }

  async createChannelListing(listing: InsertChannelListing): Promise<ChannelListing> {
    const id = this.currentChannelListingId++;
    const now = new Date();
    const channelListing: ChannelListing = {
      ...listing,
      id,
      createdAt: now,
      updatedAt: now, // Added missing property
      lastSynced: now, // Corrected property name
      syncErrors: null // Ensure nullable property is present
    };
    this.channelListings.set(id, channelListing);
    return channelListing;
  }

  async updateChannelListing(id: number, listing: Partial<ChannelListing>): Promise<ChannelListing | undefined> {
    const channelListing = this.channelListings.get(id);
    if (!channelListing) return undefined;

    const updatedListing = { ...channelListing, ...listing, updatedAt: new Date() }; // Update updatedAt
    this.channelListings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteChannelListing(id: number): Promise<boolean> {
    return this.channelListings.delete(id);
  }

  async syncChannelListing(id: number): Promise<ChannelListing | undefined> {
    const listing = this.channelListings.get(id);
    if (!listing) return undefined;

    const updatedListing = {
      ...listing,
      lastSynced: new Date(), // Corrected property name
      updatedAt: new Date() // Added missing property
    };
    this.channelListings.set(id, updatedListing);
    return updatedListing;
  }

  // Channel Rate operations
  async getChannelRate(id: number): Promise<ChannelRate | undefined> {
    return this.channelRates.get(id);
  }

  async getChannelRatesByListing(listingId: number): Promise<ChannelRate[]> {
    return Array.from(this.channelRates.values()).filter(
      rate => rate.listingId === listingId
    );
  }

  async getChannelRatesByDateRange(listingId: number, startDate: Date, endDate: Date): Promise<ChannelRate[]> {
    return Array.from(this.channelRates.values()).filter(
      rate => {
        const rateDate = new Date(rate.date);
        return rate.listingId === listingId &&
               rateDate >= startDate &&
               rateDate <= endDate;
      }
    );
  }

  async createChannelRate(rate: InsertChannelRate): Promise<ChannelRate> {
    const id = this.currentChannelRateId++;
    const now = new Date();
    const channelRate: ChannelRate = {
      ...rate,
      id,
      createdAt: now,
      updatedAt: now, // Added missing property
      isClosed: null, // Ensure nullable properties are present
      closedToArrival: null,
      closedToDeparture: null
    };
    this.channelRates.set(id, channelRate);
    return channelRate;
  }

  async updateChannelRate(id: number, rate: Partial<ChannelRate>): Promise<ChannelRate | undefined> {
    const channelRate = this.channelRates.get(id);
    if (!channelRate) return undefined;

    const updatedRate = { ...channelRate, ...rate, updatedAt: new Date() }; // Update updatedAt
    this.channelRates.set(id, updatedRate);
    return updatedRate;
  }

  async deleteChannelRate(id: number): Promise<boolean> {
    return this.channelRates.delete(id);
  }

  // Channel Reservation operations
  async getChannelReservation(id: number): Promise<ChannelReservation | undefined> {
    return this.channelReservations.get(id);
  }

  async getChannelReservationsByListing(listingId: number): Promise<ChannelReservation[]> {
    return Array.from(this.channelReservations.values()).filter(
      reservation => reservation.listingId === listingId
    );
  }

  async getChannelReservationByExternalId(externalReservationId: string): Promise<ChannelReservation | undefined> {
    return Array.from(this.channelReservations.values()).find(
      reservation => reservation.externalReservationId === externalReservationId
    );
  }

  async createChannelReservation(reservation: InsertChannelReservation): Promise<ChannelReservation> {
    const id = this.currentChannelReservationId++;
    const now = new Date();
    const channelReservation: ChannelReservation = {
      ...reservation,
      id,
      createdAt: now,
      updatedAt: now, // Added missing property
      bookingId: null, // Ensure nullable property is present
      guestPhone: reservation.guestPhone || null, // Ensure nullable property is present
      guestNotes: reservation.guestNotes || null // Ensure nullable property is present
    };
    this.channelReservations.set(id, channelReservation);
    return channelReservation;
  }

  async updateChannelReservation(id: number, reservation: Partial<ChannelReservation>): Promise<ChannelReservation | undefined> {
    const channelReservation = this.channelReservations.get(id);
    if (!channelReservation) return undefined;

    const updatedReservation = { ...channelReservation, ...reservation, updatedAt: new Date() }; // Update updatedAt
    this.channelReservations.set(id, updatedReservation);
    return updatedReservation;
  }

  async linkChannelReservationToBooking(id: number, bookingId: number): Promise<ChannelReservation | undefined> {
    const reservation = this.channelReservations.get(id);
    if (!reservation) return undefined;

    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    const updatedReservation = {
      ...reservation,
      bookingId
    };
    this.channelReservations.set(id, updatedReservation);
    return updatedReservation;
  }
}

// Export an instance of the MemStorage class
export const storage = new MemStorage();
