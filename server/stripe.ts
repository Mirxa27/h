import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

// Initialize Stripe client using the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Create a payment intent for a single booking
 * @param amount Amount in dollars to charge (will be converted to cents)
 * @param bookingDetails Additional booking details to include in the metadata
 * @returns The created payment intent
 */
export async function createPaymentIntent(
  amount: number, 
  bookingDetails: {
    propertyId: number;
    guestId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
  }
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: 'usd',
      metadata: {
        propertyId: bookingDetails.propertyId.toString(),
        guestId: bookingDetails.guestId.toString(),
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        guests: bookingDetails.guests.toString(),
        integration: 'ai_booking_assistant'
      },
    });

    return paymentIntent;
  } catch (error: any) {
    console.error('Error creating payment intent:', error.message);
    throw new Error(`Failed to create payment: ${error.message}`);
  }
}

/**
 * Retrieve a payment intent by ID
 * @param paymentIntentId The ID of the payment intent to retrieve
 * @returns The payment intent details
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error.message);
    throw new Error(`Failed to retrieve payment: ${error.message}`);
  }
}

/**
 * Create a customer in Stripe
 * @param email Customer email
 * @param name Customer name
 * @returns The created customer object
 */
export async function createCustomer(email: string, name: string) {
  try {
    return await stripe.customers.create({
      email,
      name,
    });
  } catch (error: any) {
    console.error('Error creating customer:', error.message);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

/**
 * List all available price objects (for subscriptions)
 * @returns List of price objects
 */
export async function listPrices() {
  try {
    return await stripe.prices.list({
      active: true,
      limit: 10,
    });
  } catch (error: any) {
    console.error('Error listing prices:', error.message);
    throw new Error(`Failed to list prices: ${error.message}`);
  }
}

export default stripe;