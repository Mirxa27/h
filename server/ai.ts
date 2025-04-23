import OpenAI from "openai";
import { Property } from "../shared/schema";
// Import SQL from drizzle-orm instead
import { sql } from "drizzle-orm";
// Removed unused imports to fix TypeScript warnings

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI;

// Initialize OpenAI with API key if available, otherwise create a mock for development
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (process.env.NODE_ENV === 'development') {
  console.warn('OPENAI_API_KEY not found. Using mock OpenAI client for development.');
  // Create a mock OpenAI client for development
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
  } as unknown as OpenAI;
} else {
  throw new Error('OPENAI_API_KEY environment variable is required in production');
}

// Currency symbol constant - used in the module but exported for consistency
export const SAR_SYMBOL = "ر.س";

// Define type for properties to fix implicit any warnings
export type PropertyPreferences = {
  location?: string;
  budget?: number;
  guests?: number;
  amenities?: string[];
  dateRange?: { from: string; to: string };
};

export type PropertyRecommendation = {
  id: number;
  score: number;
  explanation: string;
  matchedCriteria: string[];
};

export type RecommendationsResponse = {
  recommendations: PropertyRecommendation[];
  summary: string;
};

export async function generatePropertyRecommendations(
  preferences: PropertyPreferences,
  availableProperties: Property[] = [],
  userPreferences: Record<string, any> | null | undefined = null // Allow null or undefined
): Promise<RecommendationsResponse | { error: string }> {
  try {
    // Include available properties as context for better recommendations
    const context = `
      Available Properties: ${JSON.stringify(availableProperties, null, 2)}
      ${userPreferences ? `User Preferences: ${JSON.stringify(userPreferences, null, 2)}` : ''}

      Instructions for JSON Response:
      - Match properties that align with the user's preferences
      - Consider location, price range, number of guests, amenities, and dates
      - Prices are in Saudi Riyal (SAR/ر.س)
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
          content: `You are an AI property recommendation assistant for Habibistay. You must provide all responses as JSON objects. ${context}`,
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
          }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (response.choices[0].message.content) {
      const result = JSON.parse(response.choices[0].message.content);

      // If we have actual properties, merge AI recommendations with real property data
      if (availableProperties.length > 0) {
        if (result.recommendations && Array.isArray(result.recommendations)) {
          const enhancedRecommendations = result.recommendations.map((rec: PropertyRecommendation) => {
            // Find matching property by ID first, then fallback to other attributes
            const matchingProperty = availableProperties.find(p =>
              p.id === rec.id ||
              p.id === (rec as any).propertyId ||
              p.title === (rec as any).propertyTitle
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
  } catch (error: any) {
    console.error("Error generating property recommendations:", error.message);
    throw new Error("Failed to generate property recommendations");
  }
}

export type AssistantOption = {
  label: string;
  value: string;
  icon?: string;
};

export type AssistantResponse = {
  message: string;
  options?: AssistantOption[];
  suggestedFollowUps?: string[];
  conversationContext?: {
    recentTopics?: string[];
    userPreferences?: Record<string, any>;
    lastPropertyViewed?: number;
    conversationState?: string;
  };
};

import { type BookingStep } from "../shared/types"; // Import BookingStep using relative path

export async function generateBookingAssistantResponse(
  userMessage: string,
  previousMessages: { role: string; content: string }[] = [],
  user: { id: number; name: string } | null = null,
  availableProperties: Property[] = [],
  bookingStep: BookingStep | null = null, // Use imported type
  bookingDetails: any | null = null,
  userPreferences: any = null
): Promise<AssistantResponse> {
  try {
    // Construct the system message with context
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
      - Prices are in Saudi Riyal (SAR/ر.س)
      - Be polite, professional, and show your expertise in property recommendations
      - Keep responses concise and informative
      - Never show more than 2 properties at a time to avoid overwhelming users
    `;

    // Add booking context if available
    if (bookingStep) {
      context += `
      Current booking step: ${bookingStep}
      Booking details: ${JSON.stringify(bookingDetails, null, 2)}
      `;
    }

    // Add user context if available
    if (user) {
      context += `
      User: ${user.name} (ID: ${user.id})
      `;
    }

    const systemMessage = {
      role: "system" as const,
      content: `You are SARA (Sophisticated AI Rental Assistant) for Habibistay, a luxury property rental platform in Saudi Arabia. You are a super-intelligent AI with deep knowledge of real estate and property recommendations. You have access to advanced filtering tools and can guide users through the booking process.

      Your smart filtering capabilities include:
      - Price range filtering (budget-friendly to luxury)
      - Location-based recommendations (neighborhoods, proximity to landmarks)
      - Amenity matching (pool, gym, parking, etc.)
      - Property type filtering (apartments, villas, houses)
      - Guest capacity optimization
      - View and feature preferences
      - Date availability checking (based on provided property data)

      Booking Flow Guidance:
      1.  **Identify Booking Intent:** Recognize when a user expresses a desire to book a specific property for certain dates/guests (e.g., "I want to book property X from date A to date B").
      2.  **Confirm Details:** Clearly restate the property name, dates, number of guests, and calculated price (if possible from context, otherwise state you'll confirm price). Ask the user for confirmation.
      3.  **Check Authentication:** After confirmation, state that login is required. Ask the user if they are logged in. If they say no or are unsure, respond with a specific instruction for the frontend: **"[ACTION: REQUEST_AUTH]"**. This tells the frontend to display login/register options. Do *not* try to collect username/password yourself.
      4.  **Initiate Payment:** Once the user confirms they are logged in (or after they log in via the frontend prompt), respond with a specific instruction for the frontend: **"[ACTION: INITIATE_BOOKING_PAYMENT]"**. Include the confirmed booking details (propertyId, startDate, endDate, numGuests) in the message if possible, or rely on the frontend context. This tells the frontend to call the booking API and redirect the user to the payment gateway.
      5.  **Post-Payment:** Await notification (implicitly via user message or frontend state) about payment success/failure. If successful, confirm the booking details. If failed, offer assistance.

      Conversational Guidelines:
      - Maintain a warm, friendly, and professional tone.
      - Use natural conversational transitions.
      - Ask follow-up questions to clarify preferences or booking details.
      - Acknowledge user preferences and refer back to them.
      - Provide personalized property recommendations with reasons.
      - Anticipate user needs based on conversation history.
      - Offer helpful suggestions and local insights.
      - Respond empathetically.
      - Maintain conversation history and context.

      Always offer filtering options naturally. Remember user preferences. Use JSON format when returning structured data if specifically requested or appropriate for complex recommendations, but prioritize natural language for conversational flow and booking guidance. Use the special **[ACTION: ...]** tags exactly as specified above when interaction with the frontend UI is required for authentication or payment.

      ${context}`,
    };

    // Prepare message history
    const chatHistory = previousMessages.map(msg => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content
    }));

    // Add current user message
    const currentMessage = {
      role: "user" as const,
      content: userMessage
    };

    // Define possible property options based on the user's message and current step
    let options: AssistantOption[] = [];
    if (bookingStep === 'date_selection') {
      options = [
        { label: 'Today', value: 'today' },
        { label: 'Tomorrow', value: 'tomorrow' },
        { label: 'This weekend', value: 'weekend' },
        { label: 'Next week', value: 'next_week' }
      ];
    } else if (bookingStep === 'guest_selection') {
      options = [
        { label: '1 guest', value: '1' },
        { label: '2 guests', value: '2' },
        { label: '3 guests', value: '3' },
        { label: '4+ guests', value: '4+' }
      ];
    } else if (bookingStep === 'payment_selection') {
      options = [
        { label: 'Credit Card', value: 'credit_card' },
        { label: 'Mada', value: 'mada' },
        { label: 'Apple Pay', value: 'apple_pay' }
      ];
    } else if (!bookingStep && userMessage.toLowerCase().includes('help')) {
      options = [
        { label: 'Find a property', value: 'find_property', icon: 'search' },
        { label: 'Book a stay', value: 'book_stay', icon: 'calendar' },
        { label: 'Payment help', value: 'payment_help', icon: 'credit-card' },
        { label: 'Contact support', value: 'contact_support', icon: 'help-circle' }
      ];
    }

    // Add a special instruction to extract follow-up questions and conversation context
    const extractionMessage = {
      role: "system" as const,
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

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...chatHistory, currentMessage], // Removed extractionMessage for now, focus on booking flow
      temperature: 0.7,
    });

    let content = response.choices[0].message.content || "I'm sorry, I couldn't process that request.";

    // Extract the context JSON if present
    // Simplified return for now, context extraction removed to focus on booking flow
    return {
      message: content,
      options: options.length > 0 ? options : undefined,
      // suggestedFollowUps and conversationContext removed for simplicity in this step
    };
  } catch (error: any) {
    console.error("Error generating assistant response:", error.message);
    return {
      message: "I'm sorry, I'm having trouble understanding your request right now. Could you try again?",
      options: [
        { label: 'Find a property', value: 'find_property', icon: 'search' },
        { label: 'Contact support', value: 'contact_support', icon: 'help-circle' }
      ]
    };
  }
}

export type BookingTrendsAnalysis = {
  seasonalTrends?: string[];
  popularAmenities?: string[];
  pricingInsights?: string[];
  recommendedActions?: string[];
  forecastOccupancy?: number;
  [key: string]: any;
};

// Keep function for reference but mark it with export that isn't used
/** @deprecated */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzeBookingTrends(bookingData: any[]): Promise<BookingTrendsAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content:
            "You are an analytics assistant for Habibistay. Analyze booking data and provide insights and recommendations for hosts as JSON format output.",
        },
        {
          role: "user" as const,
          content: `Analyze these booking trends and provide insights as a JSON object: ${JSON.stringify(bookingData)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      return { error: "No analysis generated" };
    }
  } catch (error: any) {
    console.error("Error analyzing booking trends:", error.message);
    throw new Error("Failed to analyze booking trends");
  }
}

export type PricingRecommendation = {
  suggestedBasePrice?: number;
  weekdayPricing?: number;
  weekendPricing?: number;
  seasonalAdjustments?: Record<string, number>;
  competitiveAnalysis?: string;
  expectedRevenue?: number;
  [key: string]: any;
};

export async function generatePricingRecommendations(
  propertyData: any,
  marketData: any
): Promise<PricingRecommendation> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system" as const,
          content:
            "You are a pricing optimization assistant for Habibistay. Recommend optimal pricing based on property details and market data. Provide your output in JSON format.",
        },
        {
          role: "user" as const,
          content: `
            Generate pricing recommendations as a JSON object for this property:
            Property data: ${JSON.stringify(propertyData)}
            Market data: ${JSON.stringify(marketData)}
          `,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      return { error: "No pricing recommendations generated" };
    }
  } catch (error: any) {
    console.error("Error generating pricing recommendations:", error.message);
    throw new Error("Failed to generate pricing recommendations");
  }
}

// Using drizzle-orm's sql type
export type SqlParam = any; // Simplified for now to avoid type errors

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createSqlCondition(column: any, value: any) {
  // This is a wrapper function to handle SQL conditions
  // It should be implemented according to your specific needs
  // This is just a placeholder implementation
  return sql`${column} = ${value}`;
}
