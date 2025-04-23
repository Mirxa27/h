import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Plus, RefreshCw, LinkIcon, UnlinkIcon, Settings, Calendar, DollarSign, CheckCircle2, XCircle, ArrowUpDown, CreditCard, Users, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const credentialSchema = z.object({
  providerId: z.coerce.number({
    required_error: "Please select a booking site",
  }),
  apiKey: z.string().min(1, { message: "API Key is required" }),
  apiSecret: z.string().min(1, { message: "API Secret is required" }),
  accountId: z.string().optional(),
});

const listingSchema = z.object({
  propertyId: z.coerce.number({
    required_error: "Please select a property",
  }),
  providerId: z.coerce.number({
    required_error: "Please select a booking site",
  }),
  externalListingId: z.string().min(1, { message: "External listing ID is required" }),
  externalListingUrl: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
});

const rateSchema = z.object({
  date: z.coerce.date(),
  price: z.coerce.number().min(0, { message: "Price must be positive" }),
  minStay: z.coerce.number().min(1).optional(),
  maxStay: z.coerce.number().min(1).optional(),
  isClosed: z.boolean().default(false),
});

type ChannelProvider = {
  id: number;
  name: string;
  slug: string;
  apiEndpoint: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ChannelCredential = {
  id: number;
  userId: number;
  providerId: number;
  apiKey: string;
  apiSecret: string;
  accountId: string | null;
  refreshToken: string | null;
  accessToken: string | null;
  tokenExpiresAt: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type ChannelListing = {
  id: number;
  propertyId: number;
  providerId: number;
  externalListingId: string;
  externalListingUrl: string | null;
  status: string;
  lastSynced: string | null;
  syncErrors: string[] | null;
  createdAt: string;
  updatedAt: string;
};

type ChannelRate = {
  id: number;
  listingId: number;
  date: string;
  price: number;
  minStay: number | null;
  maxStay: number | null;
  closedToArrival: boolean | null;
  closedToDeparture: boolean | null;
  isClosed: boolean | null;
  createdAt: string;
  updatedAt: string;
};

type ChannelReservation = {
  id: number;
  listingId: number;
  externalReservationId: string;
  bookingId: number | null;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  numberOfGuests: number;
  totalAmount: number;
  currencyCode: string;
  status: string;
  paymentStatus: string;
  hostNotes: string | null;
  guestNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Property = {
  id: number;
  title: string;
  type: string;
  address: string;
  city: string;
  price: number;
  images: string[] | null;
};

export default function ChannelManager() {
  const [activeTab, setActiveTab] = useState("connect");
  const [addCredentialOpen, setAddCredentialOpen] = useState(false);
  const [addListingOpen, setAddListingOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ChannelListing | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch channel providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/channel-providers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/channel-providers?active=true');
      return await res.json() as ChannelProvider[];
    }
  });

  // Fetch user credentials
  const { data: credentials, isLoading: credentialsLoading } = useQuery({
    queryKey: ['/api/channel-credentials'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/channel-credentials');
      return await res.json() as ChannelCredential[];
    }
  });

  // Fetch user properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties/host'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/properties/host');
      return await res.json() as Property[];
    }
  });

  // Add credential form
  const credentialForm = useForm<z.infer<typeof credentialSchema>>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      apiKey: '',
      apiSecret: '',
      accountId: '',
    },
  });

  // Add listing form
  const listingForm = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      externalListingId: '',
      externalListingUrl: '',
    },
  });

  // Add credential mutation
  const addCredentialMutation = useMutation({
    mutationFn: async (data: z.infer<typeof credentialSchema>) => {
      const res = await apiRequest('POST', '/api/channel-credentials', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channel-credentials'] });
      setAddCredentialOpen(false);
      credentialForm.reset();
      toast({
        title: "Success!",
        description: "Booking site connected successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to connect booking site. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Verify credential mutation
  const verifyCredentialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/channel-credentials/${id}/verify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channel-credentials'] });
      toast({
        title: "Success!",
        description: "Credentials verified successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to verify credentials. Please check your API keys.",
        variant: "destructive",
      });
    }
  });

  // Delete credential mutation
  const deleteCredentialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/channel-credentials/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channel-credentials'] });
      toast({
        title: "Success!",
        description: "Booking site disconnected successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect booking site.",
        variant: "destructive",
      });
    }
  });

  // Add listing mutation
  const addListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof listingSchema>) => {
      const res = await apiRequest('POST', '/api/channel-listings', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setAddListingOpen(false);
      listingForm.reset();
      toast({
        title: "Success!",
        description: "Property listed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to list property. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Sync listing mutation
  const syncListingMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/channel-listings/${id}/sync`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Sync Initiated",
        description: "Your property is being synchronized with the booking site.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync property. Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/channel-listings/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Success!",
        description: "Property unlisted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to unlist property. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getProviderById = (id: number) => {
    return providers?.find(provider => provider.id === id);
  };

  const getPropertyById = (id: number) => {
    return properties?.find(property => property.id === id);
  };

  const handleCredentialSubmit = (data: z.infer<typeof credentialSchema>) => {
    addCredentialMutation.mutate(data);
  };

  const handleListingSubmit = (data: z.infer<typeof listingSchema>) => {
    addListingMutation.mutate(data);
  };

  // Get the user's credentials for a provider
  const getCredentialForProvider = (providerId: number) => {
    return credentials?.find(cred => cred.providerId === providerId);
  };

  // Check if a provider is connected
  const isProviderConnected = (providerId: number) => {
    return credentials?.some(cred => cred.providerId === providerId);
  };

  // Get connected providers
  const getConnectedProviders = () => {
    if (!credentials || !providers) return [];
    
    return providers.filter(provider => 
      credentials.some(cred => cred.providerId === provider.id)
    );
  };

  // Fetch listings for a specific property
  const fetchPropertyListings = async (propertyId: number) => {
    const res = await apiRequest('GET', `/api/properties/${propertyId}/channel-listings`);
    return await res.json() as ChannelListing[];
  };

  // Get listings for a specific property and provider
  const { data: propertyListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/properties', selectedProvider, 'listings'],
    queryFn: async () => {
      if (!selectedProvider) return [];
      
      // In a real implementation, we'd fetch all properties and their listings
      // Then filter by the selected provider
      const allProperties = await Promise.all(
        (properties || []).map(async (property) => {
          const listings = await fetchPropertyListings(property.id);
          return {
            ...property,
            listings: listings.filter(listing => listing.providerId === selectedProvider)
          };
        })
      );
      
      return allProperties;
    },
    enabled: !!selectedProvider && !!properties?.length
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Channel Manager</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="connect">
            <LinkIcon className="h-4 w-4 mr-2" />
            Connect Sites
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Home className="h-4 w-4 mr-2" />
            Property Listings
          </TabsTrigger>
          <TabsTrigger value="rates">
            <Calendar className="h-4 w-4 mr-2" />
            Rates & Availability
          </TabsTrigger>
          <TabsTrigger value="reservations">
            <Users className="h-4 w-4 mr-2" />
            Reservations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {providersLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {providers?.map(provider => (
                  <Card key={provider.id} className={!provider.isActive ? "opacity-60" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center">
                        {provider.logoUrl ? (
                          <img 
                            src={provider.logoUrl} 
                            alt={provider.name} 
                            className="h-8 mr-4"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted mr-4 flex items-center justify-center">
                            {provider.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <CardTitle>{provider.name}</CardTitle>
                          <CardDescription>
                            {isProviderConnected(provider.id) ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Connected
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                Not Connected
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>

                      {!provider.isActive && (
                        <Badge variant="outline" className="ml-auto mr-4">Coming Soon</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Connect your properties to {provider.name} to manage listings, rates, and reservations in one place.
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {isProviderConnected(provider.id) ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const credential = getCredentialForProvider(provider.id);
                              if (credential) {
                                verifyCredentialMutation.mutate(credential.id);
                              }
                            }}
                            disabled={!provider.isActive || verifyCredentialMutation.isPending}
                          >
                            {verifyCredentialMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Verify Connection
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              const credential = getCredentialForProvider(provider.id);
                              if (credential && confirm("Are you sure you want to disconnect? This will remove your credentials and unlink all associated listings.")) {
                                deleteCredentialMutation.mutate(credential.id);
                              }
                            }}
                            disabled={!provider.isActive || deleteCredentialMutation.isPending}
                          >
                            {deleteCredentialMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <UnlinkIcon className="h-4 w-4 mr-2" />
                            )}
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => {
                            credentialForm.setValue('providerId', provider.id);
                            setAddCredentialOpen(true);
                          }}
                          disabled={!provider.isActive}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}

                {/* Add Credential Dialog */}
                <Dialog open={addCredentialOpen} onOpenChange={setAddCredentialOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Connect Booking Site</DialogTitle>
                      <DialogDescription>
                        Enter your API credentials to connect to the booking site.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...credentialForm}>
                      <form onSubmit={credentialForm.handleSubmit(handleCredentialSubmit)} className="space-y-4">
                        <FormField
                          control={credentialForm.control}
                          name="providerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Booking Site</FormLabel>
                              <Select disabled onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a booking site" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {providers?.map(provider => (
                                    <SelectItem key={provider.id} value={provider.id.toString()}>
                                      {provider.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={credentialForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your API key" {...field} />
                              </FormControl>
                              <FormDescription>
                                The API key provided by the booking site.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={credentialForm.control}
                          name="apiSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your API secret" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                The API secret or password provided by the booking site.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={credentialForm.control}
                          name="accountId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account ID (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your account ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                Some booking sites require an account ID or username.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setAddCredentialOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={addCredentialMutation.isPending}
                          >
                            {addCredentialMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Connect
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="listings" className="space-y-6">
          {credentialsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : credentials?.length === 0 ? (
            <div className="text-center p-12">
              <h3 className="text-lg font-medium">No Connected Booking Sites</h3>
              <p className="text-muted-foreground mt-2">
                Connect to booking sites first to manage property listings.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setActiveTab("connect")}
              >
                Connect Booking Sites
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Property Listings</h2>
                  <p className="text-muted-foreground">
                    Manage your property listings across different booking sites
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Select 
                    value={selectedProvider?.toString() || ""} 
                    onValueChange={(value) => setSelectedProvider(parseInt(value))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a booking site" />
                    </SelectTrigger>
                    <SelectContent>
                      {getConnectedProviders().map(provider => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => setAddListingOpen(true)}
                    disabled={!selectedProvider}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Listing
                  </Button>
                </div>
              </div>

              {selectedProvider ? (
                listingsLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : propertyListings && propertyListings.length > 0 ? (
                  <div className="space-y-6">
                    {propertyListings.map(property => (
                      <Card key={property.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{property.title}</CardTitle>
                              <CardDescription>
                                {property.type} • {property.city}
                              </CardDescription>
                            </div>
                            {property.listings && property.listings.length > 0 ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Listed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                                Not Listed
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {property.listings && property.listings.length > 0 ? (
                            property.listings.map(listing => (
                              <div key={listing.id} className="mt-4 rounded-md border p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      {getProviderById(listing.providerId)?.name} Listing
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ID: {listing.externalListingId}
                                    </p>
                                    {listing.status && (
                                      <Badge 
                                        className={
                                          listing.status === 'active' 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : listing.status === 'inactive'
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            : listing.status === 'error'
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }
                                        variant="outline"
                                      >
                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    {listing.externalListingUrl && (
                                      <Button size="sm" variant="outline" asChild>
                                        <a 
                                          href={listing.externalListingUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                        >
                                          View
                                        </a>
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => syncListingMutation.mutate(listing.id)}
                                      disabled={syncListingMutation.isPending}
                                    >
                                      {syncListingMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                      )}
                                      Sync
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to unlist this property? This action cannot be undone.")) {
                                          deleteListingMutation.mutate(listing.id);
                                        }
                                      }}
                                      disabled={deleteListingMutation.isPending}
                                    >
                                      {deleteListingMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <UnlinkIcon className="h-4 w-4 mr-2" />
                                      )}
                                      Unlist
                                    </Button>
                                  </div>
                                </div>
                                {listing.lastSynced && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Last synced: {new Date(listing.lastSynced).toLocaleString()}
                                  </p>
                                )}
                                {listing.syncErrors && listing.syncErrors.length > 0 && (
                                  <Alert variant="destructive" className="mt-2">
                                    <AlertTitle>Sync Errors</AlertTitle>
                                    <AlertDescription>
                                      <ul className="list-disc pl-5 text-sm">
                                        {listing.syncErrors.map((error, idx) => (
                                          <li key={idx}>{error}</li>
                                        ))}
                                      </ul>
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="mt-4 text-center p-6 border border-dashed rounded-md">
                              <p className="text-muted-foreground">
                                This property is not listed on {getProviderById(selectedProvider)?.name}
                              </p>
                              <Button 
                                className="mt-4"
                                onClick={() => {
                                  listingForm.setValue('propertyId', property.id);
                                  listingForm.setValue('providerId', selectedProvider);
                                  setAddListingOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Listing
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12">
                    <h3 className="text-lg font-medium">No Properties Found</h3>
                    <p className="text-muted-foreground mt-2">
                      You don't have any properties to list.
                    </p>
                    <Button 
                      className="mt-4" 
                      asChild
                    >
                      <Link to="/host/properties/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                      </Link>
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center p-12">
                  <h3 className="text-lg font-medium">Select a Booking Site</h3>
                  <p className="text-muted-foreground mt-2">
                    Choose a booking site from the dropdown to manage your listings.
                  </p>
                </div>
              )}

              {/* Add Listing Dialog */}
              <Dialog open={addListingOpen} onOpenChange={setAddListingOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Property Listing</DialogTitle>
                    <DialogDescription>
                      Connect your property to {selectedProvider ? getProviderById(selectedProvider)?.name : 'a booking site'}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...listingForm}>
                    <form onSubmit={listingForm.handleSubmit(handleListingSubmit)} className="space-y-4">
                      <FormField
                        control={listingForm.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a property" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {properties?.map(property => (
                                  <SelectItem key={property.id} value={property.id.toString()}>
                                    {property.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={listingForm.control}
                        name="providerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Booking Site</FormLabel>
                            <Select 
                              disabled 
                              onValueChange={field.onChange} 
                              value={selectedProvider?.toString() || ''}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a booking site" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getConnectedProviders().map(provider => (
                                  <SelectItem key={provider.id} value={provider.id.toString()}>
                                    {provider.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={listingForm.control}
                        name="externalListingId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>External Listing ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter the listing ID from the booking site" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is the ID assigned to your property on {selectedProvider ? getProviderById(selectedProvider)?.name : 'the booking site'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={listingForm.control}
                        name="externalListingUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>External Listing URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter the URL to your listing" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL where guests can view your property on the booking site
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setAddListingOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={addListingMutation.isPending}
                        >
                          {addListingMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add Listing
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Rates & Availability</h2>
              <p className="text-muted-foreground">
                Manage pricing and availability across all booking sites
              </p>
            </div>
          </div>

          {/* Simplified rates management UI - in a real app this would be more complex with calendars */}
          <div className="bg-muted p-6 rounded-lg">
            <p className="text-center text-lg mb-4">
              Sync your rates and availability across all connected booking sites
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Management</CardTitle>
                  <CardDescription>
                    Set base rates and adjust seasonally
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Base Rate Strategy</label>
                      <Select defaultValue="manual">
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Pricing</SelectItem>
                          <SelectItem value="dynamic">Dynamic Pricing (AI-Powered)</SelectItem>
                          <SelectItem value="seasonal">Seasonal Adjustments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Update Frequency</label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="autosync" />
                      <label 
                        htmlFor="autosync" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Automatically sync price changes
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Pricing Rules
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Availability Calendar</CardTitle>
                  <CardDescription>
                    Manage bookings and blocked dates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Minimum Stay</label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue placeholder="Select min nights" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Night</SelectItem>
                          <SelectItem value="2">2 Nights</SelectItem>
                          <SelectItem value="3">3 Nights</SelectItem>
                          <SelectItem value="7">7 Nights</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preparation Time</label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue placeholder="Select buffer days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="2">2 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="instantBook" defaultChecked />
                      <label 
                        htmlFor="instantBook" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Allow instant booking
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Open Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <Button size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Rates & Availability Now
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Last synced: Today at 4:30 PM
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Reservations</h2>
              <p className="text-muted-foreground">
                View and manage reservations from all booking sites
              </p>
            </div>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Reservations
            </Button>
          </div>

          {/* Simplified reservations UI */}
          <Card>
            <CardHeader>
              <CardTitle>All Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Site</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Airbnb</TableCell>
                    <TableCell>John Smith</TableCell>
                    <TableCell>May 1 - May 5, 2025</TableCell>
                    <TableCell>Luxury Marina Apartment</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Confirmed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">SAR 2,400</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Booking.com</TableCell>
                    <TableCell>Sarah Johnson</TableCell>
                    <TableCell>May 10 - May 15, 2025</TableCell>
                    <TableCell>Modern Downtown Studio</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">SAR 1,250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Airbnb</TableCell>
                    <TableCell>Mohammed Al-Farsi</TableCell>
                    <TableCell>May 20 - May 25, 2025</TableCell>
                    <TableCell>Beachfront Villa</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        Confirmed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">SAR 5,600</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}