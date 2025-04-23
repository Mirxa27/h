import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Property, Booking } from "@shared/schema";
import { format } from "date-fns";
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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  DollarSign,
  Home,
  User,
  Star,
  Plus,
  List,
  Settings,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import ChannelManagerWidget from "@/components/ChannelManagerWidget";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Fetch host properties
  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: [`/api/hosts/${user?.id}/properties`],
    enabled: !!user?.id,
  });

  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user?.id,
  });

  // If user is not a host, redirect to become-host page
  if (user && !user.isHost) {
    navigate("/become-host");
    return null;
  }

  // If not logged in, redirect to login
  if (!user) {
    navigate("/login");
    return null;
  }

  // Calculate dashboard stats
  const totalProperties = properties?.length || 0;
  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  
  const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.totalPrice, 0) || 0;

  // Example chart data
  const revenueData = [
    { name: "Jan", revenue: 1200 },
    { name: "Feb", revenue: 1900 },
    { name: "Mar", revenue: 2200 },
    { name: "Apr", revenue: 2500 },
    { name: "May", revenue: 2800 },
    { name: "Jun", revenue: 3100 },
    { name: "Jul", revenue: 3500 },
    { name: "Aug", revenue: 3900 },
    { name: "Sep", revenue: 3300 },
    { name: "Oct", revenue: 2900 },
    { name: "Nov", revenue: 2400 },
    { name: "Dec", revenue: 2100 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Host Dashboard</h1>
          <p className="text-slate-500">
            Welcome back, {user.fullName}! Manage your properties and bookings.
          </p>
        </div>
        <Button onClick={() => navigate("/listing-wizard")} className="mt-4 md:mt-0">
          <Plus className="h-4 w-4 mr-2" /> Add New Property
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Bookings</p>
                <h3 className="text-2xl font-bold">{totalBookings}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Requests</p>
                <h3 className="text-2xl font-bold">{pendingBookings}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {propertiesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="h-48 relative">
                    <img
                      src={property.images?.[0] || "https://via.placeholder.com/500x300?text=No+Image"}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2">
                      {property.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {property.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3">
                      {property.city}, {property.country}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-primary font-semibold">
                        ${property.price} <span className="text-slate-500 font-normal text-sm">/ night</span>
                      </p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm">4.9</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <Home className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
              <p className="text-slate-500 mb-6">
                Start by adding your first property to HabibiStay.
              </p>
              <Button onClick={() => navigate("/listing-wizard")}>
                <Plus className="h-4 w-4 mr-2" /> Add New Property
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookingsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Recent Bookings
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Guest
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dates
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <Avatar>
                                    <AvatarFallback>
                                      {booking.guestId.toString().substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    Guest ID: {booking.guestId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Property #{booking.propertyId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {format(new Date(booking.checkIn), "MMM dd, yyyy")} - {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${booking.totalPrice}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  booking.status === "confirmed"
                                    ? "bg-green-500"
                                    : booking.status === "pending"
                                    ? "bg-yellow-500"
                                    : booking.status === "cancelled"
                                    ? "bg-red-500"
                                    : "bg-slate-500"
                                }
                              >
                                {booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-slate-500 mb-6">
                When guests book your properties, you'll see their reservations here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Your revenue over the past 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, "Revenue"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Rate</CardTitle>
                  <CardDescription>Current and projected occupancy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="relative h-32 w-32">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                          className="text-slate-100 stroke-current"
                          strokeWidth="10"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        ></circle>
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset="50.24"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">80%</span>
                      </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-slate-500">
                      Your properties are booking well compared to similar listings
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest Satisfaction</CardTitle>
                  <CardDescription>Average ratings across all properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="flex items-center mb-4">
                      <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                      <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                      <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                      <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                      <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold mb-2">4.9 / 5</p>
                    <p className="text-sm text-slate-500">Based on 45 reviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <List className="h-4 w-4 mr-2" /> View all properties
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" /> Messages
                <Badge className="ml-auto">3</Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" /> Booking calendar
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" /> Account settings
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <ChannelManagerWidget />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <p className="font-medium text-sm">John D.</p>
                  <div className="flex ml-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-3 w-3 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500">2 days ago</p>
                <p className="text-sm mt-1">
                  Great location and beautiful property. Would definitely stay again!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <p className="font-medium text-sm">Alice S.</p>
                  <div className="flex ml-2">
                    {[1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="h-3 w-3 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                    <Star className="h-3 w-3 text-slate-300" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">1 week ago</p>
                <p className="text-sm mt-1">
                  Clean and comfortable, but a bit far from the city center.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hosting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Update your photos</p>
                <p className="text-xs text-slate-500">
                  Properties with 10+ high-quality photos get 70% more bookings.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Respond quickly</p>
                <p className="text-xs text-slate-500">
                  Hosts who respond within an hour have a 60% higher booking rate.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Keep your calendar updated</p>
                <p className="text-xs text-slate-500">
                  An accurate calendar helps you avoid cancellations and penalties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Additional icons for the dashboard
function Camera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function MessageCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
