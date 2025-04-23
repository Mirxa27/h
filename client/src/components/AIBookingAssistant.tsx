import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SAR_SYMBOL } from "@/lib/constants";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Bot, 
  Send, 
  Calendar, 
  CreditCard, 
  Home, 
  Search, 
  User,
  X,
  ExternalLink,
  MapPin,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { useProperties } from "@/hooks/useProperty";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
}

interface BookingDetails {
  propertyId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentMethod: string;
}

export default function AIBookingAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your AI booking assistant. I can help you find the perfect property, answer questions, and even help you book directly. How can I assist you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    propertyId: 0,
    checkIn: format(new Date(), "yyyy-MM-dd"),
    checkOut: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    guests: 2,
    paymentMethod: "credit_card"
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: properties } = useProperties();

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Check if it looks like a booking request
      if (containsBookingIntent(input)) {
        // Show property recommendations
        const potentialProperties = await recommendProperties(input);
        if (potentialProperties && potentialProperties.length > 0) {
          setMessages([
            ...messages, 
            userMessage, 
            { 
              role: "assistant", 
              content: `I've found some properties that match your criteria! Here are some options:
              
              ${potentialProperties.map((p, i) => `**${i+1}. ${p.title}** - $${p.price}/night in ${p.city}, ${p.country}. ${p.bedrooms} bedrooms, ${p.bathrooms} bathrooms.`).join('\n\n')}
              
              Would you like more details about any of these options? Or would you like to book one of them?`
            }
          ]);
        } else {
          // If no properties match, send to regular AI assistant
          sendToAIAssistant(userMessage);
        }
      } else {
        // Regular message handling
        sendToAIAssistant(userMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...messages,
        userMessage,
        { role: "assistant" as const, content: "I'm sorry, I encountered an error. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToAIAssistant = async (userMessage: ChatMessage) => {
    try {
      const response = await apiRequest("POST", "/api/ai/assistant/chat", {
        messages: [...messages, userMessage]
      });
      
      const data = await response.json();
      
      // Check if response contains booking suggestion
      if (data.response && data.response.includes("book") && properties) {
        // Highlight booking possibility in the response
        const assistantResponse: ChatMessage = { 
          role: "assistant", 
          content: data.response
        };
        setMessages([...messages, userMessage, assistantResponse]);
        
        // Check if there's a property mention that matches our database
        const mentionedPropertyId = extractPropertyId(data.response, properties);
        if (mentionedPropertyId) {
          const property = properties.find(p => p.id === mentionedPropertyId);
          if (property) {
            setSelectedProperty(property);
            setBookingDetails({
              ...bookingDetails,
              propertyId: property.id
            });
          }
        }
      } else {
        // Regular response
        setMessages([
          ...messages, 
          userMessage, 
          { role: "assistant" as const, content: data.response || "I'm sorry, I couldn't process that request." }
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages([
        ...messages,
        userMessage,
        { role: "assistant" as const, content: "I'm sorry, I encountered an error communicating with the AI assistant. Please try again later." }
      ]);
    }
  };

  const containsBookingIntent = (message: string): boolean => {
    const bookingKeywords = [
      'book', 'booking', 'reserve', 'reservation', 'stay', 'looking for', 
      'want to find', 'need a place', 'accommodations', 'vacation', 'trip'
    ];
    return bookingKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const extractPropertyId = (message: string, propertyList: any[]): number | null => {
    for (const property of propertyList) {
      if (message.includes(property.title) || 
          message.includes(`property #${property.id}`) || 
          message.includes(`Property ${property.id}`)) {
        return property.id;
      }
    }
    return null;
  };

  const recommendProperties = async (query: string) => {
    try {
      // For demo purposes, just return some of the available properties
      if (properties && properties.length > 0) {
        // TODO: In a real app, send the query to backend for real AI-based matching
        return properties.slice(0, 3);
      }
      return [];
    } catch (error) {
      console.error("Error recommending properties:", error);
      return [];
    }
  };

  const handleBookProperty = async () => {
    if (!selectedProperty) return;
    
    try {
      setIsLoading(true);
      
      // Calculate total price based on nights and property price
      const checkInDate = new Date(bookingDetails.checkIn);
      const checkOutDate = new Date(bookingDetails.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = selectedProperty.price * nights;
      
      // Create a payment using MyFatoorah
      const response = await apiRequest("POST", "/api/payments/create", {
        amount: totalAmount,
        propertyId: selectedProperty.id,
        checkIn: bookingDetails.checkIn,
        checkOut: bookingDetails.checkOut,
        guests: bookingDetails.guests
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add processing message to chat
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: `I'm processing your booking for ${selectedProperty.title} from ${format(new Date(bookingDetails.checkIn), "MMM dd, yyyy")} to ${format(new Date(bookingDetails.checkOut), "MMM dd, yyyy")} for ${bookingDetails.guests} guests.\n\nTotal amount: ${data.currencySymbol} ${data.amount.toFixed(2)}\n\nYou'll be redirected to our secure payment page to complete your booking.`
          }
        ]);
        
        // Close dialog and redirect to MyFatoorah payment page
        setIsBookingDialogOpen(false);
        
        // Save payment information in session for future reference
        sessionStorage.setItem('pendingBooking', JSON.stringify({
          propertyId: selectedProperty.id,
          propertyTitle: selectedProperty.title,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          amount: data.amount,
          paymentId: data.paymentId
        }));
        
        // Redirect to payment page
        window.open(data.paymentUrl, '_blank');
        
        toast({
          title: "Proceeding to Payment",
          description: "You're being redirected to our secure payment gateway.",
        });
      } else {
        toast({
          title: "Booking Failed",
          description: data.message || "There was an error creating your booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error booking property:", error);
      toast({
        title: "Booking Error",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setBookingDetails({
      ...bookingDetails,
      propertyId: property.id
    });
    setIsBookingDialogOpen(true);
  };

  // Format chat messages with markdown-like syntax
  const formatMessage = (content: string): JSX.Element => {
    // Replace property suggestions with interactive elements
    if (content.includes("I've found some properties") && properties) {
      const parts = content.split(/\*\*(\d+\.\s[^*]+)\*\*/g);
      
      return (
        <div>
          {parts.map((part, index) => {
            // Check if this is a property title
            if (index % 2 === 1) {
              const propertyNumber = parseInt(part.match(/^(\d+)\./)?.[1] || "0") - 1;
              const property = propertyNumber >= 0 && propertyNumber < properties.length ? 
                properties[propertyNumber] : null;
              
              if (property) {
                return (
                  <div 
                    key={index} 
                    className="cursor-pointer p-2 my-2 bg-slate-50 rounded-md hover:bg-blue-50 border border-slate-200"
                    onClick={() => handlePropertyClick(property)}
                  >
                    <div className="font-semibold text-blue-600">{part}</div>
                    <div className="flex items-center mt-1 text-xs text-slate-500">
                      <Button variant="link" size="sm" className="h-auto p-0">
                        View details
                      </Button>
                    </div>
                  </div>
                );
              }
            }
            
            // Just render regular text
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    }
    
    // Handle confirmed booking message
    if (content.includes("✅ **Booking Confirmed!**")) {
      const [title, ...details] = content.split('\n\n');
      return (
        <div className="bg-green-50 p-3 border border-green-200 rounded-md">
          <div className="font-bold text-green-600">{title.replace('✅ **', '').replace('**', '')}</div>
          <div className="mt-2">{details.join('\n\n')}</div>
        </div>
      );
    }
    
    // Regular message formatting
    return <div>{content}</div>;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-full h-14 w-14 shadow-lg" size="icon">
            <Bot size={24} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/logo.png" alt="Habibistay AI" />
                  <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                </Avatar>
                <DialogTitle>Habibistay Assistant</DialogTitle>
              </div>
              <DialogClose className="h-8 w-8 p-0">
                <X size={18} />
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, i) => (
              <div 
                key={i}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100'
                  }`}
                >
                  {formatMessage(message.content)}
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                    <AvatarImage src={user?.profileImage || ""} alt={user?.fullName || "User"} />
                    <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] p-3 rounded-lg bg-slate-100">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="h-3 w-3 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                    <div className="h-3 w-3 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
              <Input 
                placeholder="Ask about properties or bookings..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send size={18} />
              </Button>
            </form>
            <div className="text-xs text-slate-400 mt-2 text-center">
              AI-powered booking assistant. Ask about properties, make bookings, and get recommendations.
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Booking confirmation dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Review and complete your booking details
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedProperty.images?.[0] || "https://via.placeholder.com/100x100?text=Property"} 
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedProperty.title}</h3>
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin size={14} className="mr-1" />
                    {selectedProperty.city}, {selectedProperty.country}
                  </div>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Home size={14} className="mr-1" />
                    {selectedProperty.bedrooms} bedrooms • {selectedProperty.bathrooms} bathrooms
                  </div>
                  <div className="font-medium mt-1">${selectedProperty.price} per night</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Check-in</label>
                    <Input 
                      type="date" 
                      value={bookingDetails.checkIn}
                      onChange={(e) => setBookingDetails({...bookingDetails, checkIn: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Check-out</label>
                    <Input 
                      type="date" 
                      value={bookingDetails.checkOut}
                      onChange={(e) => setBookingDetails({...bookingDetails, checkOut: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Guests</label>
                  <Select 
                    value={bookingDetails.guests.toString()}
                    onValueChange={(value) => setBookingDetails({...bookingDetails, guests: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty && selectedProperty.maxGuests && 
                        Array.from({ length: selectedProperty.maxGuests }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'guest' : 'guests'}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select 
                    value={bookingDetails.paymentMethod}
                    onValueChange={(value) => setBookingDetails({...bookingDetails, paymentMethod: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="apple_pay">Apple Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>${selectedProperty.price} x 5 nights</span>
                  <span>${selectedProperty.price * 5}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>${selectedProperty.cleaningFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${selectedProperty.serviceFee || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${selectedProperty.price * 5 + (selectedProperty.cleaningFee || 0) + (selectedProperty.serviceFee || 0)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBookProperty} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}