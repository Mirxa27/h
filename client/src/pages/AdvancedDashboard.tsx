import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Property, Booking } from "@shared/schema";
import { format, subDays, differenceInDays } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  CalendarDays,
  DollarSign,
  Home,
  User,
  Star,
  TrendingUp,
  Layers,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  RefreshCw,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  occupancyRate: number;
  averageStayLength: number;
  totalRevenue: number;
  monthlyRevenue: {
    [key: string]: number;
  };
}

interface MarketInsights {
  competitivePosition: number;
  priceRelativeToMarket: number;
  suggestedPriceAdjustment: number;
  demandForecast: string;
  seasonalityTrend: string;
  seasonalityData: number[];
}

interface AIAnalysis {
  topInsights: string[];
  recommendations: string[];
  performanceScore: number;
  forecastSummary: string;
  optimizationTips: string[];
}

export default function AdvancedDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("last30days");
  const [selectedProperty, setSelectedProperty] = useState<number | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics>({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    occupancyRate: 0,
    averageStayLength: 0,
    totalRevenue: 0,
    monthlyRevenue: {}
  });
  const [marketInsights, setMarketInsights] = useState<MarketInsights>({
    competitivePosition: 85,
    priceRelativeToMarket: 5, // % above/below market average
    suggestedPriceAdjustment: 8, // % increase suggestion
    demandForecast: "high",
    seasonalityTrend: "increasing",
    seasonalityData: [65, 72, 78, 75, 82, 90, 95, 98, 90, 85, 80, 75]
  });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    topInsights: [
      "Weekend bookings are 35% more profitable than weekday bookings",
      "Guests who book longer stays (5+ nights) are 3x more likely to leave 5-star reviews",
      "Professional photos have increased booking rates by 24%"
    ],
    recommendations: [
      "Increase weekend rates by 10-15% to maximize revenue",
      "Offer 10% discount for stays longer than 7 nights",
      "Update property photos seasonally to showcase current appeal"
    ],
    performanceScore: 86,
    forecastSummary: "Strong growth projected for the next quarter with 15-20% increase in bookings expected based on market trends and your property performance.",
    optimizationTips: [
      "Respond to inquiries within 1 hour to increase booking probability by 30%",
      "Add smart home features to justify a 7-12% price premium",
      "Highlight nearby attractions in your listing description"
    ]
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.isHost) {
      navigate("/become-host");
      return;
    }

    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch host properties
      const propertiesResponse = await apiRequest("GET", `/api/hosts/${user?.id}/properties`);
      const propertiesData = await propertiesResponse.json();
      setProperties(propertiesData);

      // Fetch bookings
      const bookingsResponse = await apiRequest("GET", "/api/bookings");
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);

      // Calculate booking analytics
      calculateBookingAnalytics(bookingsData, propertiesData);

      // In a real app, you'd also fetch these from the server
      // fetchMarketInsights();
      // fetchAIAnalysis();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBookingAnalytics = (bookingData: Booking[], propertyData: Property[]) => {
    // Filter bookings by time range
    const filteredBookings = filterBookingsByTimeRange(bookingData);
    
    // Calculate basic metrics
    const totalBookings = filteredBookings.length;
    const completedBookings = filteredBookings.filter(b => b.status === "completed").length;
    const pendingBookings = filteredBookings.filter(b => b.status === "pending").length;
    const cancelledBookings = filteredBookings.filter(b => b.status === "cancelled").length;
    
    // Calculate revenue
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Calculate average stay length
    const stayLengths = filteredBookings.map(booking => 
      differenceInDays(new Date(booking.checkOut), new Date(booking.checkIn))
    );
    const averageStayLength = stayLengths.length 
      ? stayLengths.reduce((sum, length) => sum + length, 0) / stayLengths.length
      : 0;
    
    // Calculate occupancy rate
    // This is simplified - in a real app you'd calculate based on available dates vs booked dates
    const occupancyRate = propertyData.length > 0 
      ? (completedBookings / (propertyData.length * 30)) * 100 // Assuming 30 days per month
      : 0;
    
    // Calculate monthly revenue
    const monthlyRevenue: {[key: string]: number} = {};
    filteredBookings.forEach(booking => {
      const month = format(new Date(booking.checkIn), 'MMM');
      if (monthlyRevenue[month]) {
        monthlyRevenue[month] += booking.totalPrice;
      } else {
        monthlyRevenue[month] = booking.totalPrice;
      }
    });
    
    setBookingAnalytics({
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      occupancyRate,
      averageStayLength,
      totalRevenue,
      monthlyRevenue
    });
  };

  const filterBookingsByTimeRange = (bookingData: Booking[]): Booking[] => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedTimeRange) {
      case "last7days":
        startDate = subDays(now, 7);
        break;
      case "last30days":
        startDate = subDays(now, 30);
        break;
      case "last90days":
        startDate = subDays(now, 90);
        break;
      case "last365days":
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    return bookingData.filter(booking => {
      const bookingDate = new Date(booking.checkIn);
      return bookingDate >= startDate && bookingDate <= now;
    });
  };

  const fetchAIAnalysis = async () => {
    setIsLoadingInsights(true);
    try {
      const response = await apiRequest("GET", "/api/hosts/analytics/bookings");
      const data = await response.json();
      setAiAnalysis(data);
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Chart data for revenue
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [1200, 1900, 2200, 2500, 2800, 3100, 3500, 3900, 3300, 2900, 2400, 2100],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for occupancy
  const occupancyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: [65, 72, 78, 75, 82, 90, 95, 98, 90, 85, 80, 75],
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 1,
        tension: 0.3,
      },
    ],
  };

  // Chart data for booking status
  const bookingStatusChartData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          bookingAnalytics.completedBookings || 65, 
          bookingAnalytics.pendingBookings || 25, 
          bookingAnalytics.cancelledBookings || 10
        ],
        backgroundColor: [
          'rgba(52, 211, 153, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Advanced Host Dashboard</h1>
          <p className="text-slate-500">
            Welcome, {user?.fullName}! Explore advanced analytics and insights for your properties.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Select 
            value={selectedTimeRange} 
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="last365days">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={typeof selectedProperty === "number" ? selectedProperty.toString() : selectedProperty} 
            onValueChange={(value) => setSelectedProperty(value === "all" ? "all" : parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.title.length > 20 
                    ? property.title.substring(0, 20) + '...' 
                    : property.title
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={fetchDashboardData}
            className="h-10 w-10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold">Performance Score</h2>
                <p className="text-slate-500">Based on bookings, revenue, and guest satisfaction</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-bold">{aiAnalysis.performanceScore}</div>
                  </div>
                  <svg viewBox="0 0 36 36" className="transform -rotate-90 h-32 w-32">
                    <path
                      className="stroke-slate-100"
                      fill="none"
                      strokeWidth="3"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="stroke-primary"
                      fill="none"
                      strokeWidth="3"
                      strokeDasharray={`${aiAnalysis.performanceScore}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <div className="mt-2 text-sm font-medium">
                  {aiAnalysis.performanceScore > 80 ? "Excellent" : 
                   aiAnalysis.performanceScore > 60 ? "Good" : 
                   aiAnalysis.performanceScore > 40 ? "Average" : "Needs Improvement"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Bookings</p>
                <h3 className="text-2xl font-bold">{bookingAnalytics.totalBookings}</h3>
                <p className="text-xs text-green-600 mt-1">↑ 12% from previous period</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Revenue</p>
                <h3 className="text-2xl font-bold">${bookingAnalytics.totalRevenue.toFixed(2)}</h3>
                <p className="text-xs text-green-600 mt-1">↑ 15% from previous period</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg. Stay Length</p>
                <h3 className="text-2xl font-bold">{bookingAnalytics.averageStayLength.toFixed(1)} nights</h3>
                <p className="text-xs text-green-600 mt-1">↑ 5% from previous period</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Occupancy Rate</p>
                <h3 className="text-2xl font-bold">{bookingAnalytics.occupancyRate.toFixed(0)}%</h3>
                <p className="text-xs text-green-600 mt-1">↑ 8% from previous period</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analytics" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="pricing">Smart Pricing</TabsTrigger>
          <TabsTrigger value="forecast">Market Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Your revenue over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar data={revenueChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rate</CardTitle>
                <CardDescription>
                  Monthly occupancy percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line data={occupancyChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
                <CardDescription>
                  Distribution of booking statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <Pie data={bookingStatusChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Your most recent booking activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-start p-3 rounded-lg hover:bg-slate-50">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{booking.guestId.toString().substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Guest #{booking.guestId}</p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(booking.checkIn), "MMM dd, yyyy")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mt-1">${booking.totalPrice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="ghost" className="w-full justify-center">
                  View All Bookings <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Smart analysis of your booking patterns and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                      Top Insights
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.topInsights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                            <span className="text-blue-600 text-xs font-medium">{index + 1}</span>
                          </div>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {aiAnalysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                            <span className="text-green-600 text-xs font-medium">{index + 1}</span>
                          </div>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Tips</CardTitle>
                <CardDescription>
                  Quick actions to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiAnalysis.optimizationTips.map((tip, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">Tip #{index + 1}</h4>
                        <Badge variant="outline" className="bg-blue-50">High Impact</Badge>
                      </div>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full" onClick={fetchAIAnalysis} disabled={isLoadingInsights}>
                  {isLoadingInsights ? "Loading..." : "Get Fresh Insights"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Dynamic Pricing Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions to optimize your revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {properties.slice(0, 3).map((property) => (
                    <div key={property.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                            <img 
                              src={property.images?.[0] || "https://via.placeholder.com/64x64?text=Property"} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{property.title}</h3>
                            <p className="text-sm text-slate-500">{property.city}, {property.country}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">${property.price}</span>
                            <Badge variant="outline" className="bg-green-50">
                              {marketInsights.priceRelativeToMarket > 0 
                                ? `${marketInsights.priceRelativeToMarket}% above market` 
                                : `${Math.abs(marketInsights.priceRelativeToMarket)}% below market`}
                            </Badge>
                          </div>
                          <Button variant="link" className="text-sm p-0 h-auto">
                            View pricing details
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-slate-500">Suggested Base Price</p>
                          <p className="text-lg font-bold">${Math.round(property.price * (1 + marketInsights.suggestedPriceAdjustment/100))}</p>
                          <p className="text-xs text-green-600">
                            {marketInsights.suggestedPriceAdjustment > 0 
                              ? `↑ ${marketInsights.suggestedPriceAdjustment}% increase suggested` 
                              : `↓ ${Math.abs(marketInsights.suggestedPriceAdjustment)}% decrease suggested`}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-slate-500">Weekend Premium</p>
                          <p className="text-lg font-bold">+25%</p>
                          <p className="text-xs text-green-600">↑ 5% from current</p>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-slate-500">Seasonal Adjustment</p>
                          <p className="text-lg font-bold">+15%</p>
                          <p className="text-xs text-green-600">High season coming</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" className="mr-2">Ignore</Button>
                        <Button>Apply Pricing</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
                <CardDescription>
                  How your properties compare to the market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Competitive Position</span>
                      <span className="text-sm font-medium">{marketInsights.competitivePosition}%</span>
                    </div>
                    <Progress value={marketInsights.competitivePosition} className="h-2" />
                    <p className="text-xs text-slate-500 mt-1">
                      Your properties are in the top {100-marketInsights.competitivePosition}% of the market
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Seasonality Trends</h4>
                    <div className="h-[200px]">
                      <Line 
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                          datasets: [{
                            label: 'Demand Index',
                            data: marketInsights.seasonalityData,
                            borderColor: 'rgba(147, 51, 234, 1)',
                            backgroundColor: 'rgba(147, 51, 234, 0.2)',
                            tension: 0.3,
                          }]
                        }} 
                        options={chartOptions} 
                      />
                    </div>
                    <p className="text-sm mt-2">
                      <Badge className="mr-2 bg-purple-100 text-purple-800 hover:bg-purple-100">
                        {marketInsights.seasonalityTrend}
                      </Badge>
                      Demand is {marketInsights.seasonalityTrend} over the next 3 months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Forecast</CardTitle>
                <CardDescription>
                  Projected bookings and revenue for the next quarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar 
                    data={{
                      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
                      datasets: [
                        {
                          type: 'bar',
                          label: 'Projected Revenue',
                          data: [1200, 1300, 1400, 1450, 1500, 1650, 1800, 1950, 2000, 2100, 2200, 2350],
                          backgroundColor: 'rgba(59, 130, 246, 0.5)',
                          yAxisID: 'y',
                        },
                        {
                          type: 'line',
                          label: 'Projected Bookings',
                          data: [4, 5, 5, 6, 6, 7, 8, 8, 9, 9, 10, 10],
                          borderColor: 'rgba(220, 38, 38, 1)',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          yAxisID: 'y1',
                          tension: 0.3,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: {
                            display: true,
                            text: 'Revenue ($)'
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: {
                            drawOnChartArea: false,
                          },
                          title: {
                            display: true,
                            text: 'Bookings'
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold mb-2">AI Forecast Summary</h3>
                  <p>{aiAnalysis.forecastSummary}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Opportunities</CardTitle>
                <CardDescription>
                  Upcoming events and demand drivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <Badge className="mb-2 bg-blue-100 text-blue-800">High Impact</Badge>
                    <h4 className="font-semibold">Local Music Festival</h4>
                    <p className="text-sm text-slate-500 mb-2">June 15-18, 2023</p>
                    <p className="text-sm">Expected to bring 20,000+ visitors to the area. Consider a 35% price increase.</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <Badge className="mb-2 bg-yellow-100 text-yellow-800">Medium Impact</Badge>
                    <h4 className="font-semibold">Business Conference</h4>
                    <p className="text-sm text-slate-500 mb-2">July 8-10, 2023</p>
                    <p className="text-sm">Corporate travelers will increase midweek demand. Consider a 25% price increase.</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <Badge className="mb-2 bg-green-100 text-green-800">Seasonal</Badge>
                    <h4 className="font-semibold">Summer Tourism Peak</h4>
                    <p className="text-sm text-slate-500 mb-2">July - August 2023</p>
                    <p className="text-sm">Traditional high season with 40% more searches than off-peak months.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button className="w-full">
                  View Calendar & Set Pricing
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}