import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  MessageCircle, X, Send, Calendar, Users, MapPin, ArrowRight,
  Home, Search, Star, BotMessageSquare, Loader2, RefreshCw,
  ThumbsUp, ThumbsDown, Copy, Sparkles, AlertCircle, CreditCard, Check, LogIn, UserPlus, Info, Briefcase, DollarSign, Mail, Lock, User as UserIcon, Apple, Mic, Image
} from "lucide-react";

// ** UI Component Import **
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Import default styles

// Assume these hooks and components exist and work as expected
import { useProperties } from "../hooks/useProperty.ts"; // Corrected path
import { usePropertyRecommendations } from "../hooks/usePropertyRecommendations.ts"; // Corrected path (using .ts)
import { useAuth } from "../hooks/useAuth.ts"; // Corrected path
import { apiRequest } from "../lib/queryClient.ts"; // Corrected path
import { Button } from "./ui/button.tsx"; // Corrected path
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle, DrawerDescription } from "./ui/drawer.tsx"; // Corrected path
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx"; // Corrected path
import { Badge } from "./ui/badge.tsx"; // Corrected path
import { Separator } from "./ui/separator.tsx"; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card.tsx"; // Corrected path
import { Input } from "./ui/input.tsx"; // Corrected path
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx"; // Corrected path
import { SAR_SYMBOL } from "../lib/constants.ts"; // Corrected path
import { format, differenceInDays, isBefore, startOfDay, isValid, parse, addDays } from 'date-fns';
import { v4 as uuidv4 } from "uuid";
import { useMediaQuery } from "../hooks/use-media-query.ts"; // Corrected path
import { useToast } from "../hooks/use-toast.ts"; // Corrected path
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel.tsx"; // Corrected path
import { cn } from "../lib/utils.ts"; // Corrected path

// --- Constants ---
const DEBOUNCE_DELAY = 2000; // ms for saving conversation

// --- Interfaces ---
interface MessageOption { label: string; value: string; icon?: string; }

interface BookingDetails {
  propertyId?: number;
  propertyTitle?: string;
  propertyImage?: string;
  propertyPrice?: number; // Price per night
  checkIn?: string; // Store as 'yyyy-MM-dd' for consistency and API calls
  checkOut?: string; // Store as 'yyyy-MM-dd'
  guests?: number;
  nights?: number;
  amount?: number; // Total amount
  paymentId?: string; // ID from payment gateway (e.g., MyFatoorah InvoiceId)
  status?: 'pending' | 'confirmed' | 'failed' | 'cancelled'; // Add status
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
  isLoading?: boolean; // Represents AI thinking/API calls *for this message*
  properties?: any[]; // Consider defining a Property interface
  options?: MessageOption[];
  feedback?: "positive" | "negative";
  bookingContext?:
    | 'general' | 'greeting' | 'property_selection' | 'property_details'
    | 'prompt_checkin' | 'prompt_checkout' | 'prompt_guests' | 'prompt_confirmation' | 'confirmation_summary'
    | 'prompt_login_register' | 'prompt_payment' | 'payment_processing' | 'payment_redirect' | 'booking_success' | 'booking_failure'
    | 'registration_prompt' | 'registration_name_prompt' | 'registration_email_prompt' | 'registration_password_prompt' | 'registration_processing' | 'registration_success' | 'registration_failure'
    | 'error_message';
  bookingDetails?: Partial<BookingDetails>; // Allow partial details during the flow
  renderDatePicker?: 'checkin' | 'checkout'; // Flag to render date picker IN the message
}

// --- State Definitions ---
type FlowStep =
  | 'idle'
  // Property Discovery
  | 'awaiting_property_query'
  | 'awaiting_property_selection'
  // Booking Flow
  | 'awaiting_checkin'
  | 'awaiting_checkout'
  | 'awaiting_guests'
  | 'awaiting_confirmation'
  | 'awaiting_login_for_booking'
  | 'awaiting_payment_method'
  | 'processing_payment_initiation'
  | 'redirecting_to_payment'
  | 'processing_booking_creation' // Backend step after payment callback
  // Registration Flow
  | 'awaiting_registration_start'
  | 'awaiting_registration_name'
  | 'awaiting_registration_email'
  | 'awaiting_registration_password'
  | 'processing_registration'
  // Final States
  | 'booking_complete'
  | 'booking_failed'
  | 'registration_complete'
  | 'payment_failed';

interface AppState {
  currentFlow: 'idle' | 'booking' | 'registration' | 'discovery';
  currentStep: FlowStep;
  selectedProperty: { id: number | null; title: string; image: string; price: number | null; maxGuests: number | null; };
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  guests: number | null;
  calculatedNights: number | null;
  calculatedAmount: number | null;
  registrationDetails: { name: string; email: string; };
  paymentMethodSelected?: 'card' | 'applepay';
  paymentSessionUrl?: string;
  paymentAttemptId?: string; // e.g., InvoiceId
  lastUserMessage: string;
  lastActionIntent?: string;
  errorState: { hasError: boolean; message?: string; };
  conversationId?: string; // Added conversationId to AppState
}

const initialAppState: AppState = {
  currentFlow: 'idle',
  currentStep: 'idle',
  selectedProperty: { id: null, title: '', image: '', price: null, maxGuests: null },
  checkInDate: undefined,
  checkOutDate: undefined,
  guests: null,
  calculatedNights: null,
  calculatedAmount: null,
  registrationDetails: { name: '', email: '' },
  paymentMethodSelected: undefined,
  paymentSessionUrl: undefined,
  paymentAttemptId: undefined,
  lastUserMessage: '',
  lastActionIntent: undefined,
  errorState: { hasError: false },
  conversationId: undefined, // Initialize conversationId
};

// --- Component ---
export default function SARA() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAwaitingApi, setIsAwaitingApi] = useState(false);
  const [appState, setAppState] = useState<AppState>(initialAppState);
  // Removed local conversationId state, will use appState.conversationId
  const [, navigate] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { user, login: contextLogin, logout: contextLogout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const { toast } = useToast();
  const [language, setLanguage] = useState("english");

  // --- Core Functions ---

  // Add Message to State
  const addMessage = useCallback((msgData: Omit<Message, 'id' | 'timestamp'>): Message => {
    // Strip action tags before saving/displaying
    const contentWithoutActions = (msgData.content || '').replace(/\[ACTION:.*?\]/g, '').trim();

    const newMessage: Message = {
      id: uuidv4(),
      timestamp: new Date(),
      bookingContext: msgData.bookingContext ?? 'general',
      ...msgData,
      content: contentWithoutActions, // Use stripped content
    };
    // Clear date picker flag from previous messages when adding a new one
    setMessages(prev => [...prev.map(m => ({ ...m, renderDatePicker: undefined })), newMessage]);
    return newMessage;
  }, []); // No external dependencies

  // Central API Loading Wrapper
  const withApiLoading = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsAwaitingApi(true);
    setAppState(prev => ({ ...prev, errorState: { hasError: false } }));
    try {
      return await asyncFn();
    } catch (error: any) {
      console.error("API Error:", error);
      const errorMessage = error.message || "An unexpected error occurred.";
      addMessage({ sender: 'assistant', content: `Oops! Something went wrong: ${errorMessage}`, isError: true, bookingContext: 'error_message' });
      setAppState(prev => ({ ...prev, errorState: { hasError: true, message: errorMessage } }));
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      return null;
    } finally {
      setIsAwaitingApi(false);
    }
  }, [addMessage, toast]); // Depends on addMessage, toast

  // --- Input Parsing & Validation ---
  const parseDateInput = (text: string): Date | null => {
      try {
          let parsed = parse(text, 'yyyy-MM-dd', new Date());
          if (isValid(parsed)) return parsed;
          parsed = parse(text, 'MM/dd/yyyy', new Date());
          if (isValid(parsed)) return parsed;
          parsed = parse(text, 'd MMMM yyyy', new Date());
          if (isValid(parsed)) return parsed;
          if (text.toLowerCase() === 'today') return startOfDay(new Date());
          if (text.toLowerCase() === 'tomorrow') return startOfDay(addDays(new Date(), 1));
          return null;
      } catch (e) { return null; }
  };
  const parseGuestsInput = (text: string): number | null => {
    const cleanedText = text.toLowerCase().replace(/[^0-9]/g, '');
    const num = parseInt(cleanedText, 10);
    return !isNaN(num) && num > 0 ? num : null;
  };
  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string): boolean => password.length >= 8;

  // --- Helper Functions ---
  const determineFlowFromStep = (step: FlowStep): AppState['currentFlow'] => {
      if (step.startsWith('awaiting_registration') || step.startsWith('processing_registration')) return 'registration';
      if (step.startsWith('awaiting_property')) return 'discovery';
      if (step === 'idle' || step.includes('_complete') || step.includes('_failed')) return 'idle';
      // Default to booking for most other steps
      return 'booking';
  };

  // --- Main AI Interaction ---
  const sendToAI = useCallback(async (messageContent: string) => {
    await withApiLoading(async () => {
      const contextForAI = {
        userId: user?.id,
        conversationId: appState.conversationId, // Use from state
        currentFlow: appState.currentFlow,
        currentStep: appState.currentStep,
        bookingDetails: {
          propertyId: appState.selectedProperty.id,
          propertyTitle: appState.selectedProperty.title,
          checkIn: appState.checkInDate ? format(appState.checkInDate, 'yyyy-MM-dd') : undefined,
          checkOut: appState.checkOutDate ? format(appState.checkOutDate, 'yyyy-MM-dd') : undefined,
          guests: appState.guests,
          nights: appState.calculatedNights,
          amount: appState.calculatedAmount,
        },
        registrationDetails: appState.registrationDetails,
        isAuthenticated: !!user,
        lastUserMessage: appState.lastUserMessage,
      };

      const response = await apiRequest('POST', '/api/ai/assistant/chat', {
          message: messageContent,
          context: contextForAI
      });

      if (!response || !response.ok) {
          const errorData = response ? await response.json().catch(() => ({})) : {};
          const detail = errorData.message || "Failed to get response from assistant.";
          console.error("AI request failed:", detail);
          // Error message added by withApiLoading wrapper
          setAppState(prev => ({ ...prev, currentStep: 'idle', currentFlow: 'idle' })); // Reset on AI failure
          return;
      }

      const data = await response.json();
      const rawContent = data.reply || "...";
      let options = data.options; // Use options from AI by default
      let bookingContext = data.bookingContext || 'general';

      // Check for ACTION tags
      const requestAuthMatch = rawContent.match(/\[ACTION:\s*REQUEST_AUTH\s*\]/i);
      // const initiatePaymentMatch = rawContent.match(/\[ACTION:\s*INITIATE_BOOKING_PAYMENT\s*\]/i); // No longer used directly

      if (requestAuthMatch) {
        bookingContext = 'prompt_login_register'; // Set context for clarity
        if (!user) {
          // User not logged in, provide login/register options
          options = [
            { label: 'Log In', value: 'action_login', icon: 'log-in' },
            { label: 'Create Account', value: 'action_start_registration', icon: 'user-plus' }
          ];
        } else {
          // User is logged in, remove options, maybe add a note?
          options = undefined; // No options needed if already logged in
          // Optionally, send a silent message back to AI? For now, just display stripped message.
        }
      }
      // else if (initiatePaymentMatch) { // No longer used directly
      //   // This logic is now handled by user selecting payment method in handleProcessUserInput
      //   // bookingContext = 'prompt_payment';
      //   // options = [
      //   //     { label: 'Pay with Card', value: 'action_pay_card', icon: 'credit-card' },
      //   //     { label: 'Pay with Apple Pay', value: 'action_pay_applepay', icon: 'apple' }
      //   // ];
      // }

      const assistantMsgData: Omit<Message, 'id' | 'timestamp'> = {
        sender: 'assistant',
        content: rawContent, // Pass raw content to addMessage which will strip tags
        bookingContext: bookingContext,
        properties: data.properties,
        options: options, // Use potentially modified options
        bookingDetails: data.bookingDetails,
        renderDatePicker: (bookingContext === 'prompt_checkin' || data.nextStep === 'awaiting_checkin') ? 'checkin' :
                          (bookingContext === 'prompt_checkout' || data.nextStep === 'awaiting_checkout') ? 'checkout' : undefined,
      };

      // State transition logic (remains largely the same)
      if (data.nextStep && data.nextStep !== appState.currentStep) {
        const nextStep = data.nextStep as FlowStep;
        const nextFlow = determineFlowFromStep(nextStep);
        console.log(`AI suggests state transition: ${appState.currentStep} -> ${nextStep} (Flow: ${nextFlow})`);

        if (['booking_complete', 'booking_failed', 'registration_complete', 'payment_failed'].includes(nextStep)) {
            const currentConvoId = appState.conversationId;
            setAppState({...initialAppState, conversationId: currentConvoId});
            if (nextStep === 'booking_complete') toast({ title: "Booking Confirmed!", variant: "default" }); // Fix: Use "default" variant
            if (nextStep === 'registration_complete') toast({ title: "Registration Successful!", variant: "default" }); // Fix: Use "default" variant
            if (nextStep === 'booking_failed' || nextStep === 'payment_failed') toast({ title: "Booking Failed", variant: "destructive" });
        } else {
            setAppState(prev => ({
                ...prev,
                currentStep: nextStep,
                currentFlow: nextFlow,
                // Merge details (remains the same)
                ...(data.bookingDetails?.propertyId && { selectedProperty: { ...prev.selectedProperty, id: data.bookingDetails.propertyId }}),
                ...(data.bookingDetails?.propertyTitle && { selectedProperty: { ...prev.selectedProperty, title: data.bookingDetails.propertyTitle }}),
                ...(data.bookingDetails?.propertyImage && { selectedProperty: { ...prev.selectedProperty, image: data.bookingDetails.propertyImage }}),
                ...(data.bookingDetails?.propertyPrice && { selectedProperty: { ...prev.selectedProperty, price: data.bookingDetails.propertyPrice }}),
                ...(data.bookingDetails?.maxGuests && { selectedProperty: { ...prev.selectedProperty, maxGuests: data.bookingDetails.maxGuests }}),
                ...(data.bookingDetails?.checkIn && isValid(parse(data.bookingDetails.checkIn, 'yyyy-MM-dd', new Date())) && { checkInDate: parse(data.bookingDetails.checkIn, 'yyyy-MM-dd', new Date()) }),
                ...(data.bookingDetails?.checkOut && isValid(parse(data.bookingDetails.checkOut, 'yyyy-MM-dd', new Date())) && { checkOutDate: parse(data.bookingDetails.checkOut, 'yyyy-MM-dd', new Date()) }),
                ...(data.bookingDetails?.guests && { guests: data.bookingDetails.guests }),
                ...(data.bookingDetails?.nights && { calculatedNights: data.bookingDetails.nights }),
                ...(data.bookingDetails?.amount && { calculatedAmount: data.bookingDetails.amount }),
                ...(data.registrationDetails?.name && { registrationDetails: { ...prev.registrationDetails, name: data.registrationDetails.name }}),
                ...(data.registrationDetails?.email && { registrationDetails: { ...prev.registrationDetails, email: data.registrationDetails.email }}),
            }));
        }
      } else if (!data.nextStep && appState.currentFlow !== 'idle' && !data.properties && (!options || !options.some((o: MessageOption) => o.value.startsWith('action_')))) {
         // If AI didn't provide a next step but we are in a flow, assume it's prompting for the current step
         assistantMsgData.bookingContext = `${appState.currentStep}_prompt` as any;
      }

      addMessage(assistantMsgData); // addMessage now strips action tags

    }); // End withApiLoading
  }, [appState, user, toast, addMessage, withApiLoading]); // Dependencies

  // --- Flow Handlers ---

  // Called when a date is selected/parsed
  const handleBookingDateSelect = useCallback((date: Date | undefined, type: 'checkIn' | 'checkOut') => {
    if (isAwaitingApi || !date || !isValid(date)) {
        if (!date) addMessage({ sender: 'assistant', content: "Please select a valid date.", isError: true, bookingContext: 'error_message' });
        return;
    }

    const today = startOfDay(new Date());
    const selectedDay = startOfDay(date);
    let validationError = '';
    let nextStep: FlowStep = appState.currentStep;
    let promptMessage = '';
    let updatedState = { ...appState };
    let options: MessageOption[] | undefined = undefined;
    let renderPicker: 'checkin' | 'checkout' | undefined = undefined;
    let bookingCtx: Message['bookingContext'] = 'general';

    if (type === 'checkIn') {
      if (isBefore(selectedDay, today)) {
        validationError = "Check-in date cannot be in the past. Please pick today or a future date.";
      } else {
        updatedState.checkInDate = selectedDay;
        // Clear checkout date if check-in changes and checkout is before new check-in
        if (updatedState.checkOutDate && !isBefore(selectedDay, updatedState.checkOutDate)) {
            updatedState.checkOutDate = undefined;
            updatedState.calculatedNights = null;
            updatedState.calculatedAmount = null;
        }
        nextStep = 'awaiting_checkout';
        promptMessage = `Got it, check-in on ${format(selectedDay, 'MMMM d, yyyy')}. Now, when will you **check out**?`;
        renderPicker = 'checkout'; // Fix: Use lowercase to match type 'checkin' | 'checkout'
        bookingCtx = 'prompt_checkout';
      }
    } else { // Check-out
      const checkInDate = appState.checkInDate;
      if (!checkInDate || !isValid(checkInDate)) {
        validationError = "Please select a check-in date first.";
        nextStep = 'awaiting_checkin';
        renderPicker = 'checkin'; // Fix: Use lowercase to match type 'checkin' | 'checkout'
        bookingCtx = 'prompt_checkin';
      } else if (!isBefore(startOfDay(checkInDate), selectedDay)) {
        validationError = `Check-out date (${format(selectedDay, 'MMM d')}) must be after your check-in date (${format(checkInDate, 'MMM d')}).`;
        renderPicker = 'checkout'; // Fix: Use lowercase to match type 'checkin' | 'checkout'
        bookingCtx = 'prompt_checkout';
      } else {
        const nights = differenceInDays(selectedDay, startOfDay(checkInDate));
        if (nights <= 0) {
            validationError = "Check-out must be at least one night after check-in.";
            renderPicker = 'checkout'; // Fix: Use lowercase to match type 'checkin' | 'checkout'
            bookingCtx = 'prompt_checkout';
        } else {
            updatedState.checkOutDate = selectedDay;
            updatedState.calculatedNights = nights;
            // Recalculate amount if price is known
            const pricePerNight = updatedState.selectedProperty.price;
            updatedState.calculatedAmount = (nights && pricePerNight) ? nights * pricePerNight : null;
            nextStep = 'awaiting_guests';
            promptMessage = `Okay, check-out on ${format(selectedDay, 'MMMM d, yyyy')} (${nights} night${nights > 1 ? 's' : ''}).\n\nHow many **guests** will be staying? (Max: ${updatedState.selectedProperty.maxGuests || 'N/A'})`;
            const max = updatedState.selectedProperty.maxGuests || 4;
            options = Array.from({ length: max }, (_, i) => i + 1).map(num => ({
                label: `${num} Guest${num > 1 ? 's' : ''}`, value: `select_guests_${num}`, icon: 'users'
            }));
            bookingCtx = 'prompt_guests';
        }
      }
    }

    if (validationError) {
      addMessage({ sender: 'assistant', content: validationError, isError: true, bookingContext: 'error_message', renderDatePicker: renderPicker });
      if (nextStep !== appState.currentStep) {
          setAppState(prev => ({ ...prev, currentStep: nextStep }));
      }
    } else {
      setAppState({ ...updatedState, currentStep: nextStep });
      addMessage({ sender: 'assistant', content: promptMessage, bookingContext: bookingCtx, options: options, renderDatePicker: renderPicker });
    }
  }, [appState, isAwaitingApi, addMessage]); // Dependencies

  // Called when guest number selected/entered
  const handleGuestSelect = useCallback((numGuests: number) => {
    if (isAwaitingApi || numGuests <= 0) return;

    const maxGuests = appState.selectedProperty.maxGuests;
    let validationError = '';

    if (maxGuests && numGuests > maxGuests) {
        validationError = `Sorry, this property allows a maximum of ${maxGuests} guest${maxGuests > 1 ? 's' : ''}. Please enter a valid number.`;
    }

    if (validationError) {
        addMessage({ sender: 'assistant', content: validationError, isError: true, bookingContext: 'error_message' });
        setAppState(prev => ({ ...prev, currentStep: 'awaiting_guests' }));
    } else {
        const nights = appState.calculatedNights;
        const pricePerNight = appState.selectedProperty.price;
        const calculatedAmount = (nights && pricePerNight) ? nights * pricePerNight : null;

        setAppState(prev => ({
            ...prev,
            guests: numGuests,
            calculatedAmount: calculatedAmount, // Ensure amount is updated/recalculated here
            currentStep: 'awaiting_confirmation'
        }));

        const summaryDetails: BookingDetails = {
            propertyId: appState.selectedProperty.id!,
            propertyTitle: appState.selectedProperty.title,
            propertyImage: appState.selectedProperty.image,
            checkIn: appState.checkInDate ? format(appState.checkInDate, 'yyyy-MM-dd') : 'N/A',
            checkOut: appState.checkOutDate ? format(appState.checkOutDate, 'yyyy-MM-dd') : 'N/A',
            nights: nights ?? undefined,
            guests: numGuests,
            amount: calculatedAmount ?? undefined,
            propertyPrice: pricePerNight ?? undefined,
        };

        addMessage({
            sender: 'assistant',
            content: "Alright! Please review your booking details:",
            bookingContext: 'confirmation_summary',
            bookingDetails: summaryDetails,
            options: [
                { label: 'Confirm & Proceed to Payment', value: 'action_confirm_booking', icon: 'check' },
                { label: 'Cancel Request', value: 'action_cancel_booking', icon: 'x' },
            ]
        });
    }
  }, [appState, isAwaitingApi, addMessage]); // Dependencies

  // Cancel the current booking flow
  const handleCancelBooking = useCallback((cancelMessage: string = "Okay, I've cancelled this booking request. How else can I help?") => {
    if (isAwaitingApi) return;
    addMessage({ sender: 'assistant', content: cancelMessage, bookingContext: 'general' });
    const currentConvoId = appState.conversationId; // Preserve conversation ID
    setAppState({...initialAppState, conversationId: currentConvoId}); // Reset state but keep convo ID
    toast({ title: "Booking Cancelled", variant: "default" }); // Fix: Use "default" variant
  }, [isAwaitingApi, addMessage, toast, appState.conversationId]); // Dependencies

  // Called when user confirms the booking summary
  const handleConfirmBookingIntent = useCallback(() => {
    if (isAwaitingApi || appState.currentStep !== 'awaiting_confirmation') return;

    if (!appState.selectedProperty.id || !appState.checkInDate || !appState.checkOutDate || !appState.guests || appState.calculatedAmount === null || appState.calculatedNights === null) {
      addMessage({ sender: 'assistant', content: "Sorry, some booking details seem to be missing. Let's start over.", isError: true, bookingContext: 'error_message' });
      handleCancelBooking("Resetting due to missing details.");
      return;
    }

    if (!user) {
      setAppState(prev => ({ ...prev, currentStep: 'awaiting_login_for_booking' }));
      addMessage({
          sender: 'assistant',
          content: "You need to be logged in to complete the booking. Please log in or create an account.",
          bookingContext: 'prompt_login_register',
          options: [
              { label: 'Log In', value: 'action_login', icon: 'log-in' },
              { label: 'Create Account', value: 'action_start_registration', icon: 'user-plus' }
          ]
      });
      return;
    }

    setAppState(prev => ({ ...prev, currentStep: 'awaiting_payment_method' }));
    addMessage({
        sender: 'assistant',
        content: "Great! Your booking details are confirmed. How would you like to pay?",
        bookingContext: 'prompt_payment',
        options: [
            { label: 'Pay with Card', value: 'action_pay_card', icon: 'credit-card' },
            { label: 'Pay with Apple Pay', value: 'action_pay_applepay', icon: 'apple' }
        ]
    });
  }, [appState, user, isAwaitingApi, addMessage, handleCancelBooking]); // Dependencies

  // Called when a payment method is selected
  const handlePaymentMethodSelect = useCallback(async (method: 'card' | 'applepay') => {
    if (isAwaitingApi || appState.currentStep !== 'awaiting_payment_method') return;

    setAppState(prev => ({ ...prev, currentStep: 'processing_payment_initiation', paymentMethodSelected: method }));
    addMessage({ sender: 'assistant', content: `Okay, preparing the ${method === 'card' ? 'card payment' : 'Apple Pay'} process...`, isLoading: true, bookingContext: 'payment_processing' });

    const paymentResult = await withApiLoading(async () => {
        const response = await apiRequest('POST', '/api/payments/initiate-myfatoorah', {
            bookingDetails: {
                propertyId: appState.selectedProperty.id,
                checkIn: format(appState.checkInDate!, 'yyyy-MM-dd'),
                checkOut: format(appState.checkOutDate!, 'yyyy-MM-dd'),
                guests: appState.guests,
                amount: appState.calculatedAmount,
                nights: appState.calculatedNights,
            },
            paymentMethodId: method === 'card' ? 2 : 10, // Example MyFatoorah IDs
            userId: user?.id,
            customerName: user?.fullName,
            customerEmail: user?.email,
            // callbackUrl: `${window.location.origin}/payment/callback`, // Define actual URLs
            // errorUrl: `${window.location.origin}/payment/error`,
        });
        if (!response || !response.ok) {
            const errorData = response ? await response.json().catch(() => ({})) : {};
            throw new Error(errorData.message || 'Failed to initiate payment.');
        }
        return await response.json();
    });

    if (paymentResult) {
      if (method === 'card' && paymentResult.paymentUrl && paymentResult.invoiceId) {
        setAppState(prev => ({
            ...prev,
            currentStep: 'redirecting_to_payment',
            paymentSessionUrl: paymentResult.paymentUrl,
            paymentAttemptId: paymentResult.invoiceId
        }));
        addMessage({ sender: 'assistant', content: "Success! Redirecting you to our secure payment page...", bookingContext: 'payment_redirect' });
        toast({ title: "Redirecting to Payment", description: "Please wait...", variant: "default" });
        // Redirect immediately for better UX
        window.location.href = paymentResult.paymentUrl;
        // setTimeout(() => { window.location.href = paymentResult.paymentUrl; }, 2000); // Removed delay
      } else if (method === 'applepay' && paymentResult.invoiceId) { // Assume invoiceId is returned even for Apple Pay initiation
          setAppState(prev => ({
              ...prev,
              currentStep: 'awaiting_payment_method', // Revert step, user needs to click link/button
              paymentAttemptId: paymentResult.invoiceId
          }));
          addMessage({
              sender: 'assistant',
              content: `Apple Pay requires interaction on our secure checkout page. Click below to proceed. (Ref: ${paymentResult.invoiceId})`,
              bookingContext: 'prompt_payment',
              options: [
                  { label: "Proceed to Apple Pay Checkout", value: `redirect_/checkout?paymentRef=${paymentResult.invoiceId}`, icon: 'apple' }
              ]
          });
          toast({ title: "Apple Pay", description: "Please proceed to the checkout page.", variant: "default" });
      } else {
          // Handle unexpected response or other methods
          addMessage({ sender: 'assistant', content: "Sorry, there was an issue setting up the payment. Please try another method.", isError: true, bookingContext: 'error_message' });
          setAppState(prev => ({ ...prev, currentStep: 'awaiting_payment_method' })); // Revert step
      }
    } else {
      // API call failed (error handled by withApiLoading)
      setAppState(prev => ({ ...prev, currentStep: 'awaiting_payment_method' })); // Revert step
    }
  }, [appState, isAwaitingApi, user, addMessage, toast, withApiLoading, navigate]); // Dependencies

  // --- Registration Flow ---
  const handleStartRegistration = useCallback(() => {
    if (isAwaitingApi) return;
    setAppState(prev => ({
      ...initialAppState, // Reset most state
      conversationId: prev.conversationId, // Keep conversation ID
      currentFlow: 'registration',
      currentStep: 'awaiting_registration_name',
      registrationDetails: { name: '', email: '' }
    }));
    addMessage({
      sender: 'assistant',
      content: "Great! Let's create your HabibiStay account. First, what's your full name?",
      bookingContext: 'registration_name_prompt'
    });
  }, [isAwaitingApi, addMessage, appState.conversationId]); // Dependencies

  const handleRegistrationStep = useCallback(async (field: 'name' | 'email' | 'password', value: string) => {
    if (isAwaitingApi) return;

    let validationError = '';
    let nextStep: FlowStep = appState.currentStep;
    let promptMessage = '';
    let updatedState = { ...appState };

    if (field === 'name') {
      if (!value || value.length < 3) {
        validationError = "Please enter a valid full name (at least 3 characters).";
      } else {
        updatedState.registrationDetails.name = value;
        nextStep = 'awaiting_registration_email';
        promptMessage = `Thanks, ${value.split(' ')[0]}! Now, please enter your email address.`;
        updatedState.currentStep = nextStep;
      }
    } else if (field === 'email') {
      if (!isValidEmail(value)) {
        validationError = "That doesn't look like a valid email address. Please try again.";
      } else {
        updatedState.registrationDetails.email = value;
        nextStep = 'awaiting_registration_password';
        promptMessage = `Got it (${value}). Finally, choose a password (minimum 8 characters).`;
        updatedState.currentStep = nextStep;
      }
    } else if (field === 'password') {
      if (!isValidPassword(value)) {
        validationError = "Password must be at least 8 characters long. Please choose a stronger password.";
      } else {
        nextStep = 'processing_registration';
        promptMessage = `Okay, ${updatedState.registrationDetails.name.split(' ')[0]}, creating your account...`;
        updatedState.currentStep = nextStep;

        setAppState(updatedState);
        addMessage({ sender: 'assistant', content: promptMessage, isLoading: true, bookingContext: 'registration_processing' });

        const registrationResult = await withApiLoading(async () => {
            const response = await apiRequest('POST', '/api/auth/register', {
                fullName: updatedState.registrationDetails.name,
                email: updatedState.registrationDetails.email,
                password: value
            });
            if (!response || !response.ok) {
                const errorData = response ? await response.json().catch(() => ({})) : {};
                throw new Error(errorData.message || 'Registration failed. Please try again.');
            }
            return await response.json();
        });

        if (registrationResult) {
            const currentConvoId = appState.conversationId; // Preserve conversation ID
            setAppState({ // Reset state fully after registration
                ...initialAppState,
                currentStep: 'registration_complete',
                conversationId: currentConvoId
             });
            addMessage({
                sender: 'assistant',
                content: registrationResult.message || `Welcome, ${updatedState.registrationDetails.name.split(' ')[0]}! You're registered and logged in. How can I help you now?`,
                bookingContext: 'registration_success',
                options: [
                  { label: 'Find a place to stay', value: 'action_find_property', icon: 'search' },
                  { label: 'View my bookings', value: 'action_my_bookings', icon: 'calendar' }
                ]
            });
            toast({ title: "Registration Successful!", description: "You are now logged in.", variant: "default" }); // Fix: Use "default" variant
            // Remove unnecessary contextLogin call, AuthProvider handles setting user state
            // if (registrationResult.user && contextLogin) {
            //     contextLogin(registrationResult.user);
            // }
        } else {
            // Failure (error handled by withApiLoading)
            setAppState(prev => ({ ...prev, currentStep: 'awaiting_registration_password' })); // Revert step
        }
        return; // Exit early
      }
    }

    if (validationError) {
      addMessage({ sender: 'assistant', content: validationError, isError: true, bookingContext: 'registration_failure' });
    } else if (field !== 'password') { // Only update state and prompt for name/email success
      setAppState(updatedState);
      addMessage({ sender: 'assistant', content: promptMessage, bookingContext: `${nextStep}_prompt` as any });
    }
  }, [appState, isAwaitingApi, addMessage, toast, contextLogin, withApiLoading]); // Dependencies

  // Called when a property card/option is selected
  const handlePropertySelect = useCallback((property: any) => {
    if (!property || !property.id || isAwaitingApi) return;
    console.log("Property Selected:", property);

    const newBookingState: AppState = {
      ...initialAppState,
      conversationId: appState.conversationId,
      currentFlow: 'booking',
      currentStep: 'awaiting_checkin',
      selectedProperty: {
        id: property.id,
        title: property.title || 'Selected Property',
        image: property.images?.[0]?.url || property.featuredImage || '/placeholder-image.png',
        price: property.price || null,
        maxGuests: property.maxGuests || 4,
      },
      lastUserMessage: appState.lastUserMessage,
    };
    setAppState(newBookingState);

    addMessage({
        sender: 'assistant',
        content: `Great choice! You selected "${newBookingState.selectedProperty.title}".\n\nNow, let's pick your dates. When would you like to **check in**?`,
        bookingContext: 'prompt_checkin',
        renderDatePicker: 'checkin' // Fix: Use lowercase to match type 'checkin' | 'checkout'
    });
  }, [isAwaitingApi, addMessage, appState.conversationId, appState.lastUserMessage]); // Dependencies

  // --- User Input/Action Handlers ---

  // Main Message Handler
  const handleProcessUserInput = useCallback(async () => {
    const userInput = input.trim();
    if (!userInput || isAwaitingApi) return;

    setInput('');
    addMessage({ sender: 'user', content: userInput });
    setAppState(prev => ({ ...prev, lastUserMessage: userInput }));

    let handledByFlow = false;
    const currentState = appState; // Capture state at the time of input

    try {
        switch (currentState.currentFlow) {
            case 'booking':
                if (currentState.currentStep === 'awaiting_checkin' || currentState.currentStep === 'awaiting_checkout') {
                    const parsedDate = parseDateInput(userInput);
                    // Fix: Correct casing for handleBookingDateSelect parameter
                    if (parsedDate) { handleBookingDateSelect(parsedDate, currentState.currentStep === 'awaiting_checkin' ? 'checkIn' : 'checkOut'); handledByFlow = true; }
                } else if (currentState.currentStep === 'awaiting_guests') {
                    const parsedGuests = parseGuestsInput(userInput);
                    if (parsedGuests !== null) { handleGuestSelect(parsedGuests); handledByFlow = true; }
                } else if (currentState.currentStep === 'awaiting_confirmation') {
                    const confirmKeywords = ['yes', 'confirm', 'ok', 'proceed', 'yep', 'sure', 'book it', 'sounds good', 'correct'];
                    const cancelKeywords = ['no', 'cancel', 'stop', 'never mind', 'wrong', 'change'];
                    if (confirmKeywords.some(k => userInput.toLowerCase().includes(k))) { handleConfirmBookingIntent(); handledByFlow = true; }
                    else if (cancelKeywords.some(k => userInput.toLowerCase().includes(k))) { handleCancelBooking("Let's adjust. What would you like to change?"); handledByFlow = true; }
                } else if (currentState.currentStep === 'awaiting_payment_method') {
                    const lowerInput = userInput.toLowerCase();
                    if (lowerInput.includes('card') || lowerInput.includes('credit')) {
                        handlePaymentMethodSelect('card');
                        handledByFlow = true;
                    } else if (lowerInput.includes('apple')) {
                        handlePaymentMethodSelect('applepay');
                        handledByFlow = true;
                    }
                }
                break;
            case 'registration':
                if (currentState.currentStep === 'awaiting_registration_name') { handleRegistrationStep('name', userInput); handledByFlow = true; }
                else if (currentState.currentStep === 'awaiting_registration_email') { handleRegistrationStep('email', userInput); handledByFlow = true; }
                else if (currentState.currentStep === 'awaiting_registration_password') { handleRegistrationStep('password', userInput); handledByFlow = true; }
                break;
        }

        if (!handledByFlow) {
            await sendToAI(userInput);
        }
    } catch (error: any) {
        console.error("Error processing user input:", error);
        addMessage({ sender: 'assistant', content: `Sorry, I encountered an issue processing that: ${error.message}`, isError: true, bookingContext: 'error_message' });
        const currentConvoId = appState.conversationId; // Preserve conversation ID
        setAppState({...initialAppState, currentFlow: 'idle', currentStep: 'idle', errorState: { hasError: true, message: error.message }, conversationId: currentConvoId });
    }

  }, [input, appState, isAwaitingApi, addMessage, sendToAI, handleBookingDateSelect, handleGuestSelect, handleConfirmBookingIntent, handleCancelBooking, handlePaymentMethodSelect, handleRegistrationStep]); // Dependencies

  // Action & Option Handling
  const handleOptionClick = useCallback((option: MessageOption) => {
    if (isAwaitingApi) return;
    const { value, label } = option;

    addMessage({ sender: 'user', content: label });
    setAppState(prev => ({ ...prev, lastUserMessage: label, lastActionIntent: value }));

    if (value.startsWith('action_')) {
        switch (value) {
            case 'action_start_registration': handleStartRegistration(); break;
            case 'action_login': navigate('/login'); setIsOpen(false); break;
            case 'action_signup': navigate('/register'); setIsOpen(false); break;
            case 'action_confirm_booking': handleConfirmBookingIntent(); break;
            case 'action_cancel_booking': handleCancelBooking("Okay, cancelling this booking request."); break;
            case 'action_pay_card': handlePaymentMethodSelect('card'); break;
            case 'action_pay_applepay': handlePaymentMethodSelect('applepay'); break;
            case 'action_find_property': // Fallthrough
            case 'action_top_rated': // Fallthrough
            case 'action_my_bookings':
                const currentConvoId = appState.conversationId; // Preserve conversation ID
                setAppState({...initialAppState, currentFlow: 'discovery', currentStep: 'awaiting_property_query', conversationId: currentConvoId });
                sendToAI(label);
                break;
            default:
                console.warn("Unhandled action:", value);
                const currentConvoIdDef = appState.conversationId; // Preserve conversation ID
                setAppState({...initialAppState, conversationId: currentConvoIdDef });
                sendToAI(label);
                break;
        }
    } else if (value.startsWith('select_property_')) {
        const propertyId = parseInt(value.replace('select_property_', ''), 10);
        // Find the message containing the properties array
        const propertyMessage = messages.slice().reverse().find(m => m.properties && m.properties.length > 0);
        const property = propertyMessage?.properties?.find(p => p.id === propertyId);
        if (property) { handlePropertySelect(property); }
        else {
            console.error("Property details not found for selection:", propertyId);
            addMessage({ sender: 'assistant', content: "Sorry, I couldn't find the details for that selection. Could you try again?", isError: true, bookingContext: 'error_message' });
            setAppState(prev => ({ ...prev, currentStep: 'awaiting_property_selection' }));
        }
    } else if (value.startsWith('select_guests_')) {
        const guests = parseInt(value.replace('select_guests_', ''), 10);
        handleGuestSelect(guests);
    } else if (value.startsWith('redirect_')) {
        const url = value.replace('redirect_', '');
        addMessage({ sender: 'assistant', content: `Okay, taking you to ${url}...`, bookingContext: 'general' });
        navigate(url);
        setIsOpen(false);
    } else {
        sendToAI(label);
    }

  }, [messages, user, navigate, sendToAI, appState, toast, isAwaitingApi, addMessage, handleStartRegistration, handleConfirmBookingIntent, handleCancelBooking, handlePaymentMethodSelect, handlePropertySelect, handleGuestSelect]); // Dependencies

  // --- UI Rendering Helpers ---
  const handleFeedback = useCallback((messageId: string, feedbackType: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: feedbackType } : m));
    toast({ title: "Feedback Received", description: "Thank you!", variant: "default" });
    // Consider sending feedback to backend
    // apiRequest('POST', '/api/ai/assistant/feedback', { messageId, feedback: feedbackType, conversationId: appState.conversationId });
  }, [toast, appState.conversationId]); // Dependencies

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast({ title: "Copied!", variant: "default" })) // Fix: Use "default" variant
      .catch(() => toast({ title: "Failed to copy", variant: "destructive" }));
  }, [toast]); // Dependencies

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const icons: { [key: string]: React.ElementType } = {
        search: Search, star: Star, calendar: Calendar, users: Users, map: MapPin,
        home: Home, bot: BotMessageSquare, creditcard: CreditCard, 'credit-card': CreditCard,
        check: Check, x: X, login: LogIn, 'log-in': LogIn, userplus: UserPlus, 'user-plus': UserPlus,
        info: Info, briefcase: Briefcase, dollar: DollarSign, 'dollar-sign': DollarSign,
        mail: Mail, lock: Lock, user: UserIcon, apple: Apple, arrowright: ArrowRight,
        'arrow-right': ArrowRight, send: Send, copy: Copy, thumbsup: ThumbsUp,
        'thumbs-up': ThumbsUp, thumbsdown: ThumbsDown, 'thumbs-down': ThumbsDown,
        sparkles: Sparkles, loader: Loader2, 'loader-2': Loader2, refresh: RefreshCw,
        'refresh-cw': RefreshCw, alert: AlertCircle, 'alert-circle': AlertCircle,
    };
    const IconComponent = icons[iconName.toLowerCase()];
    return IconComponent ? <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" /> : null;
  };

  const hasError = messages.some(m => m.isError);
  const errorCount = messages.filter(m => m.isError).length;

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    
    // Translate welcome message based on language
    let welcomeMessage;
    switch (lang) {
      case "arabic":
        welcomeMessage = "مرحبًا! أنا سارة، مساعدتك في السفر. كيف يمكنني مساعدتك اليوم؟";
        break;
      case "french":
        welcomeMessage = "Bonjour! Je suis Sara, votre assistante de voyage. Comment puis-je vous aider aujourd'hui?";
        break;
      case "spanish":
        welcomeMessage = "¡Hola! Soy Sara, tu asistente de viaje. ¿Cómo puedo ayudarte hoy?";
        break;
      default:
        welcomeMessage = "Hi there! I'm Sara, your travel assistant. How can I help you today?";
    }
    
    // Update the first message
    setMessages([
      { id: uuidv4(), sender: "assistant", content: welcomeMessage, timestamp: new Date() },
    ]);
  };

  // --- Effects ---

  // Initialize/Reset on User Change or Component Mount
  useEffect(() => {
    const newConversationId = uuidv4();
    setAppState(prev => ({ ...initialAppState, conversationId: newConversationId }));
    setMessages([]);
  }, [user]); // Reset full state on user change

  // Initial Greeting Message
  useEffect(() => {
    // Ensure conversationId is set before sending the greeting
    if (isOpen && messages.length === 0 && appState.conversationId) {
      addMessage({
        sender: 'assistant',
        content: `Ahlan ${user ? user.fullName?.split(' ')[0] : ''}! Welcome to HabibiStay. I'm SARA, your booking assistant. How can I help you today?`,
        bookingContext: 'greeting',
        options: [
          { label: 'Find a place to stay', value: 'action_find_property', icon: 'search' },
          { label: 'Show top-rated properties', value: 'action_top_rated', icon: 'star' },
          ...(user ? [{ label: 'View my bookings', value: 'action_my_bookings', icon: 'calendar' }]
                  : [{ label: 'Log In', value: 'action_login', icon: 'log-in' }, { label: 'Create Account', value: 'action_start_registration', icon: 'user-plus' }])
        ]
      });
    }
    // Only run when isOpen becomes true, or user/convoId changes while open&empty
  }, [isOpen, messages.length, appState.conversationId, user, addMessage]);

  // Scroll to Bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounced Conversation Saving
  const saveConversationDebounced = useCallback(async (msgs: Message[], state: AppState, convoId: string) => {
      if (!user || msgs.length === 0 || !convoId) return;
      console.log("Debounced save triggered for convo:", convoId);
      // *** Implement actual API call here ***
      // await apiRequest('POST', '/api/ai/assistant/save', {
      //   conversationId: convoId,
      //   messages: msgs.map(m => ({...m, properties: undefined, options: undefined })), // Simplify payload
      //   appState: { // Save only resumable state
      //       currentFlow: state.currentFlow,
      //       currentStep: state.currentStep,
      //       selectedProperty: state.selectedProperty,
      //       checkInDate: state.checkInDate ? format(state.checkInDate, 'yyyy-MM-dd') : undefined,
      //       checkOutDate: state.checkOutDate ? format(state.checkOutDate, 'yyyy-MM-dd') : undefined,
      //       guests: state.guests,
      //       // etc.
      //   },
      //   userId: user.id,
      // });
  }, [user]); // Dependency on user

  useEffect(() => {
      if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); }
      if (messages.length > 0 && appState.conversationId) {
        const msgsToSave = messages;
        const stateToSave = appState;
        const convoIdToSave = appState.conversationId;
        debounceTimerRef.current = setTimeout(() => {
            saveConversationDebounced(msgsToSave, stateToSave, convoIdToSave);
        }, DEBOUNCE_DELAY);
      }
      return () => { if (debounceTimerRef.current) { clearTimeout(debounceTimerRef.current); } };
  }, [messages, appState, saveConversationDebounced]); // Dependencies

  // --- JSX ---
  return (
    <>
      {/* Chat Trigger Button */}
       <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
           <Button
             size="icon"
             className={cn(
               "fixed z-50 h-16 w-16 sm:h-14 sm:w-14 rounded-full shadow-xl transition-all duration-300 ease-in-out group border-4 border-background dark:border-gray-900 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
               isMobile ? "bottom-20 right-4" : isTablet ? "bottom-12 right-6" : "bottom-8 right-8",
               hasError ? "bg-destructive hover:bg-destructive/90 border-destructive/30 animate-pulse" : "bg-primary hover:bg-primary/90",
               isAwaitingApi ? "cursor-wait bg-primary/80 animate-none" : "hover:scale-110 animate-bounce-slow",
             )}
             aria-label="Open SARA AI Assistant"
           >
             <div className="relative flex items-center justify-center h-full w-full">
               {isAwaitingApi ? ( <Loader2 className="h-7 w-7 text-primary-foreground animate-spin" /> )
                : hasError ? ( <AlertCircle className="h-8 w-8 sm:h-7 sm:w-7 text-destructive-foreground animate-pulse" /> )
                : ( <BotMessageSquare className="h-8 w-8 sm:h-7 sm:w-7 text-primary-foreground transition-transform duration-300 group-hover:scale-110" /> )}
               {!hasError && !isAwaitingApi && !isOpen && ( <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400"></span></span> )}
               <span className="absolute -top-2 -left-2 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full h-5 w-5 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">AI</span>
               {hasError && ( <Badge variant="destructive" className="absolute -bottom-2 -right-2 text-xs font-bold h-5 w-5 p-0 flex items-center justify-center shadow-md">{errorCount > 9 ? '9+' : errorCount}</Badge> )}
             </div>
           </Button>
         </DrawerTrigger>

        {/* Chat Drawer Content */}
        <DrawerContent className="h-[85svh] flex flex-col max-w-md mx-auto rounded-t-xl bg-background shadow-2xl outline-none">
          {/* Header */}
          <div className="border-b p-3 flex justify-between items-center bg-primary/95 text-primary-foreground flex-shrink-0 backdrop-blur-sm sticky top-0 z-10">
             <div className="flex items-center gap-2">
               <Avatar className="h-8 w-8 border-2 border-background/50">
                 <AvatarImage src="/sara-avatar.png" alt="SARA" />
                 <AvatarFallback><Sparkles className="h-4 w-4 text-background/80" /></AvatarFallback>
               </Avatar>
               <div>
                 <DrawerTitle className="text-base font-semibold">SARA Assistant</DrawerTitle>
                 <DrawerDescription className="text-xs text-primary-foreground/80">Your HabibiStay Booking Agent</DrawerDescription>
               </div>
             </div>
             <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:bg-primary-foreground/10" onClick={() => handleCancelBooking("Okay, let's start over. How can I help?")} aria-label="Restart Conversation">
                   <RefreshCw className="h-4 w-4" />
                </Button>
               <DrawerClose asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:bg-primary-foreground/10" aria-label="Close Chat">
                   <X className="h-5 w-5" />
                 </Button>
               </DrawerClose>
             </div>
          </div>

          {/* Language selector */}
          <div className="px-4 py-2 border-b bg-muted/30">
            <select
              className="text-xs w-full p-1 rounded border"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="english">English</option>
              <option value="arabic">العربية</option>
              <option value="french">Français</option>
              <option value="spanish">Español</option>
            </select>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-muted/20 scroll-smooth">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
                {message.sender === 'assistant' && ( <Avatar className="h-8 w-8 border bg-background flex-shrink-0 self-start mt-1 shadow-sm"><AvatarImage src="/sara-avatar.png" alt="SARA" /><AvatarFallback><Sparkles className="h-4 w-4 text-primary/90" /></AvatarFallback></Avatar> )}
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 relative shadow-md transition-all duration-200 text-sm",
                  message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none'
                    : message.isError ? 'bg-destructive/10 border border-destructive/30 text-destructive-foreground rounded-bl-none'
                    : 'bg-background text-card-foreground border border-border/50 rounded-bl-none',
                  message.isLoading ? 'opacity-70 animate-pulse' : ''
                )}>
                  {message.isLoading && message.sender === 'assistant' && ( <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>{message.content || "Thinking..."}</span></div> )}
                  {!message.isLoading && ( <div className="prose prose-sm dark:prose-invert max-w-none break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}></div> )}

                  {/* Property Carousel */}
                  {message.properties && message.properties.length > 0 && (
                      <div className="mt-3 -mx-2">
                          <Carousel opts={{ align: "start", loop: message.properties.length > 2 }} className="w-full">
                              <CarouselContent>
                                  {message.properties.map((prop: any) => (
                                      <CarouselItem key={prop.id} className="basis-[85%] sm:basis-[75%] pl-2 pr-1">
                                          <Card className="overflow-hidden shadow-sm border-border/60">
                                              <CardHeader className="p-0"><img src={prop.images?.[0]?.url || prop.featuredImage || '/placeholder-image.png'} alt={prop.title} className="w-full h-32 object-cover" /></CardHeader>
                                              <CardContent className="p-3 text-xs">
                                                  <p className="font-semibold text-sm mb-1 truncate">{prop.title}</p>
                                                  <div className="flex items-center text-muted-foreground mb-1"><MapPin className="h-3 w-3 mr-1" /> <span className="truncate">{prop.location || 'Location N/A'}</span></div>
                                                  <div className="flex items-center text-muted-foreground mb-2"><Users className="h-3 w-3 mr-1" /> {prop.maxGuests || '?'} Guests   <Star className="h-3 w-3 mr-1 text-yellow-500" /> {prop.rating?.toFixed(1) || 'New'}</div>
                                                  <div className="flex justify-between items-center">
                                                      <p className="text-sm font-semibold text-primary">{SAR_SYMBOL}{prop.price?.toLocaleString() || 'N/A'} <span className="text-xs font-normal text-muted-foreground">/ night</span></p>
                                                      <Button size="sm" variant="outline" onClick={() => handleOptionClick({ label: `Select: ${prop.title}`, value: `select_property_${prop.id}` })} disabled={isAwaitingApi}>Select <ArrowRight className="h-3 w-3 ml-1" /></Button> {/* Fix: Change size="xs" to "sm" */}
                                                  </div>
                                              </CardContent>
                                          </Card>
                                      </CarouselItem>
                                  ))}
                              </CarouselContent>
                              {message.properties.length > 1 && ( <>
                                    <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-background/80 hover:bg-background border-border/50" />
                                    <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 bg-background/80 hover:bg-background border-border/50" />
                              </> )}
                          </Carousel>
                      </div>
                  )}

                  {/* Booking Confirmation Summary Card */}
                  {message.bookingContext === 'confirmation_summary' && message.bookingDetails && (
                      <Card className="mt-3 bg-muted/50 border-border/40 shadow-inner">
                          <CardHeader className="pb-2 pt-3 px-3"><CardTitle className="text-sm font-semibold">Booking Summary</CardTitle></CardHeader>
                          <CardContent className="text-xs px-3 pb-3 space-y-1.5">
                              {message.bookingDetails.propertyTitle && <div className="flex justify-between"><span className="text-muted-foreground">Property:</span> <span className="font-medium text-right">{message.bookingDetails.propertyTitle}</span></div>}
                              {message.bookingDetails.checkIn && message.bookingDetails.checkOut && <div className="flex justify-between"><span className="text-muted-foreground">Dates:</span> <span className="font-medium">{format(parse(message.bookingDetails.checkIn, 'yyyy-MM-dd', new Date()), 'MMM d')} - {format(parse(message.bookingDetails.checkOut, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}</span></div>}
                              {message.bookingDetails.nights !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Nights:</span> <span className="font-medium">{message.bookingDetails.nights}</span></div>}
                              {message.bookingDetails.guests !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">Guests:</span> <span className="font-medium">{message.bookingDetails.guests}</span></div>}
                              <Separator className="my-1.5" />
                              {message.bookingDetails.amount !== undefined && <div className="flex justify-between text-base"><span className="font-semibold">Total:</span> <span className="font-bold text-primary">{SAR_SYMBOL}{message.bookingDetails.amount.toLocaleString()}</span></div>}
                          </CardContent>
                      </Card>
                  )}

                  {/* Inline Date Picker Rendering */}
                  {message.renderDatePicker && (
                      <div className="mt-3 -mx-2 p-0 flex justify-center">
                          <DayPicker
                              mode="single"
                              selected={message.renderDatePicker === 'checkin' ? appState.checkInDate : appState.checkOutDate} // Fix: Use lowercase for comparison
                              onSelect={(date) => handleBookingDateSelect(date, message.renderDatePicker === 'checkin' ? 'checkIn' : 'checkOut')} // Fix: Pass correct camelCase to handler
                              fromDate={message.renderDatePicker === 'checkout' && appState.checkInDate ? addDays(appState.checkInDate, 1) : new Date()} // Fix: Use lowercase for comparison
                              disabled={isAwaitingApi || (message.renderDatePicker === 'checkout' && !appState.checkInDate)} // Fix: Use lowercase for comparison
                              className="bg-background rounded-md border border-border/60 shadow-sm scale-[0.9] origin-top-left sm:scale-100 sm:origin-center"
                              classNames={{
                                  caption: "flex justify-center pt-1.5 relative items-center text-sm", nav: "space-x-1 flex items-center",
                                  head_row: "flex justify-center w-full mt-2", head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                                  row: "flex w-full mt-1.5 justify-center", cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                  day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100", day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                                  day_today: "bg-accent text-accent-foreground rounded-md", day_outside: "text-muted-foreground opacity-50", day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                              }}
                              showOutsideDays
                          />
                      </div>
                  )}

                  {/* Quick Reply Options / Buttons */}
                  {message.options && message.options.length > 0 && !message.isLoading && (
                      <div className="mt-3 pt-2 border-t border-border/20 flex flex-wrap gap-2">
                          {message.options.map((option) => (
                              <Button key={option.value} variant="outline" size="sm" className="text-xs h-auto py-1.5 px-3 bg-background hover:bg-accent" onClick={() => handleOptionClick(option)} disabled={isAwaitingApi}>
                                  {renderIcon(option.icon)} {option.label}
                              </Button>
                          ))}
                      </div>
                  )}

                  {/* Timestamp and Feedback */}
                  {message.sender === 'assistant' && !message.isLoading && !message.isError && (
                      <div className="flex items-center justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-1 -right-1 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded-full border border-border/30">
                          <Button variant="ghost" size="icon" className={`h-5 w-5 ${message.feedback === 'positive' ? 'text-green-500 bg-green-100 dark:bg-green-900/50' : 'text-muted-foreground/70 hover:text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50'}`} onClick={() => handleFeedback(message.id, 'positive')} disabled={!!message.feedback} aria-label="Good response"><ThumbsUp className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className={`h-5 w-5 ${message.feedback === 'negative' ? 'text-red-500 bg-red-100 dark:bg-red-900/50' : 'text-muted-foreground/70 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50'}`} onClick={() => handleFeedback(message.id, 'negative')} disabled={!!message.feedback} aria-label="Bad response"><ThumbsDown className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50" onClick={() => handleCopy(message.content)} aria-label="Copy message"><Copy className="h-3 w-3" /></Button>
                      </div>
                  )}
                  {message.sender === 'user' && ( <span className="text-xs text-primary-foreground/60 absolute bottom-0.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">{format(message.timestamp, 'HH:mm')}</span> )}
                </div>
                {message.sender === 'user' && ( <Avatar className="h-8 w-8 border flex-shrink-0 self-end shadow-sm"><AvatarImage src={user?.profileImage || "/avatars/user-default.png"} alt="You" /><AvatarFallback>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar> )}
              </div>
            ))}
            <div ref={messagesEndRef} className="h-px" />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background flex-shrink-0 shadow-inner">
            <form onSubmit={(e) => { e.preventDefault(); handleProcessUserInput(); }} className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Mic size={18} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Image size={18} />
              </Button>
              <div className="relative flex-1">
                 <Input
                   placeholder={
                       isAwaitingApi ? 'SARA is thinking...' :
                       appState.currentFlow === 'booking' ? (
                           appState.currentStep === 'awaiting_checkin' ? 'Select check-in or type date...' :
                           appState.currentStep === 'awaiting_checkout' ? 'Select check-out or type date...' :
                           appState.currentStep === 'awaiting_guests' ? 'Enter number of guests...' :
                           appState.currentStep === 'awaiting_confirmation' ? 'Type Yes/Confirm or No/Cancel...' :
                           appState.currentStep === 'awaiting_payment_method' ? 'Choose payment method above or type...' :
                           'Continue booking...'
                       ) : appState.currentFlow === 'registration' ? (
                           appState.currentStep === 'awaiting_registration_name' ? 'Enter your full name...' :
                           appState.currentStep === 'awaiting_registration_email' ? 'Enter your email address...' :
                           appState.currentStep === 'awaiting_registration_password' ? 'Enter password (min 8 chars)...' :
                           'Continue registration...'
                       ) : 'Ask SARA anything about stays...'
                   }
                   type={appState.currentStep === 'awaiting_registration_password' ? 'password' : 'text'}
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyPress={(e) => { if (e.key === 'Enter' && !isAwaitingApi && !e.shiftKey) { e.preventDefault(); handleProcessUserInput(); } }}
                   className={`pr-10 h-11 text-sm ${isAwaitingApi ? 'bg-muted cursor-not-allowed' : ''}`}
                   disabled={isAwaitingApi}
                   aria-label="Chat input"
                   autoComplete="off"
                 />
                 {input.trim().length > 0 && !isAwaitingApi && ( <Button size="icon" variant="ghost" type="button" aria-label="Clear input" className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => setInput('')}><X className="h-4 w-4" /></Button> )}
              </div>
              <Button type="submit" size="icon" disabled={isAwaitingApi || !input.trim()} className="transition-all duration-300 h-11 w-11 flex-shrink-0 disabled:opacity-60" aria-label="Send message">
                {isAwaitingApi ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-center px-2 gap-1">
                <Sparkles className="h-3 w-3 text-primary/80 flex-shrink-0" />
                <p className="text-center">SARA - AI Booking Assistant</p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
