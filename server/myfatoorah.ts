import axios from 'axios';

// MyFatoorah API endpoints
const API_URL = 'https://apitest.myfatoorah.com'; // Use the test API during development
const PAYMENT_URL = `${API_URL}/v2/InitiatePayment`;
const EXECUTE_URL = `${API_URL}/v2/ExecutePayment`;
const PAYMENT_STATUS_URL = `${API_URL}/v2/GetPaymentStatus`;
const CUSTOMER_URL = `${API_URL}/v2/CreateCustomer`;

// Currency information
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SAR_SYMBOL = 'ر.س';

// Helper to make authenticated requests to MyFatoorah API
const makeRequest = async (url: string, data: any) => {
  if (!process.env.MYFATOORAH_API_KEY) {
    throw new Error('MYFATOORAH_API_KEY environment variable not set');
  }

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${process.env.MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('MyFatoorah API error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`MyFatoorah API error: ${error.response.data.Message || error.message}`);
    }
    throw error;
  }
};

/**
 * Create a payment for a booking
 * @param amount Amount in SAR to charge
 * @param bookingDetails Additional booking details to include in the metadata
 * @returns The created payment details
 */
export async function createPayment(
  amount: number,
  bookingDetails: {
    propertyId: number;
    checkIn: string;
    checkOut: string;
    guests: number;
  }
) {
  // Initialize payment with MyFatoorah
  const initResponse = await makeRequest(PAYMENT_URL, {
    InvoiceAmount: amount,
    CurrencyIso: 'SAR',
    Language: 'en'
  });

  // Set up the execute payment request
  const executeData = {
    PaymentMethodId: initResponse.Data.PaymentMethods[0].PaymentMethodId, // Use the first available payment method
    InvoiceValue: amount,
    CallBackUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/payment/callback`,
    ErrorUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/payment/error`,
    CustomerName: 'Guest User', // You might want to replace this with actual user info
    DisplayCurrencyIso: 'SAR',
    MobileCountryCode: '966', // Saudi Arabia country code
    CustomerMobile: '555555555', // This would be replaced with actual user info
    CustomerEmail: 'guest@habibistay.com', // This would be replaced with actual user info
    Language: 'en',
    CustomerReference: `booking_${Date.now()}`,
    InvoiceItems: [
      {
        ItemName: 'Property Booking',
        Quantity: 1,
        UnitPrice: amount
      }
    ],
    UserDefinedField: JSON.stringify(bookingDetails)
  };

  // Execute the payment
  const executeResponse = await makeRequest(EXECUTE_URL, executeData);

  return {
    paymentId: executeResponse.Data.InvoiceId,
    paymentUrl: executeResponse.Data.PaymentURL,
    amount: executeResponse.Data.InvoiceValue,
    currencySymbol: SAR_SYMBOL
  };
}

/**
 * Get payment status
 * @param paymentId The payment ID to check
 * @returns The payment status details
 */
export async function getPaymentStatus(paymentId: string) {
  const response = await makeRequest(PAYMENT_STATUS_URL, {
    Key: paymentId,
    KeyType: 'InvoiceId'
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

/**
 * Execute payment
 * @param paymentId The payment ID to execute
 * @returns The payment execution result
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function executePayment(paymentId: string) {
  const status = await getPaymentStatus(paymentId);
  return status;
}

/**
 * Create a customer in MyFatoorah
 * @param email Customer email
 * @param name Customer name
 * @param mobile Customer mobile number (optional)
 * @returns The created customer object
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createCustomer(email: string, name: string, mobile?: string) {
  const response = await makeRequest(CUSTOMER_URL, {
    CustomerEmail: email,
    CustomerName: name,
    CustomerMobile: mobile || '',
    MobileCountryCode: '966', // Saudi Arabia country code
    Language: 'en'
  });

  return {
    customerId: response.Data.CustomerId,
    name: response.Data.CustomerName,
    email: response.Data.CustomerEmail,
    mobile: response.Data.CustomerMobile
  };
}
