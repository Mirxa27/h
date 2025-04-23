import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

type ChannelProvider = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
};

type ChannelCredential = {
  id: number;
  providerId: number;
  isVerified: boolean;
};

type ChannelListing = {
  id: number;
  propertyId: number;
  providerId: number;
  status: string;
};

export default function ChannelManagerWidget() {
  const [channels, setChannels] = useState([
    { id: 1, name: "Booking.com", status: "Connected" },
    { id: 2, name: "Expedia", status: "Disconnected" },
    { id: 3, name: "VRBO", status: "Connected" },
  ]);

  const handleConnect = (id) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, status: "Connected" } : channel
      )
    );
  };

  const handleDisconnect = (id) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, status: "Disconnected" } : channel
      )
    );
  };

  // Fetch channel providers that the user has connected
  const { data: credentials, isLoading: credentialsLoading } = useQuery({
    queryKey: ['/api/channel-credentials'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/channel-credentials');
      if (!res.ok) return [];
      return await res.json() as ChannelCredential[];
    }
  });

  // Fetch all channel providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/channel-providers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/channel-providers?active=true');
      if (!res.ok) return [];
      return await res.json() as ChannelProvider[];
    }
  });

  // Get listings count for all properties
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/channel-listings/count'],
    queryFn: async () => {
      // Simulated data - in production this would be a real endpoint
      return {
        total: 5,
        byProvider: [
          { providerId: 1, count: 3 },
          { providerId: 2, count: 2 },
        ],
        active: 4,
        pending: 1,
        error: 0
      };
    }
  });

  const isLoading = credentialsLoading || providersLoading || listingsLoading;

  const getConnectedProviders = () => {
    if (!credentials || !providers) return [];
    
    return providers.filter(provider => 
      credentials.some(cred => cred.providerId === provider.id)
    );
  };

  const getConnectedCount = () => {
    return getConnectedProviders().length;
  };

  const getProviderById = (id: number) => {
    return providers?.find(provider => provider.id === id);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Channel Manager</CardTitle>
        <CardDescription>
          Manage your property listings across booking sites
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-md p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Connected Sites</p>
                <p className="text-2xl font-bold">{getConnectedCount()}/{providers?.length || 0}</p>
              </div>
              <div className="bg-muted rounded-md p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Listings</p>
                <p className="text-2xl font-bold">{listings?.active || 0}</p>
              </div>
              <div className="bg-muted rounded-md p-4 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Listings</p>
                <p className="text-2xl font-bold">{listings?.total || 0}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium">Connected Booking Sites</h4>
              
              {getConnectedProviders().length > 0 ? (
                <div className="space-y-2">
                  {getConnectedProviders().map(provider => {
                    const providerListings = listings?.byProvider.find(p => p.providerId === provider.id);
                    
                    return (
                      <div 
                        key={provider.id} 
                        className="flex items-center justify-between p-3 rounded-md border"
                      >
                        <div className="flex items-center">
                          {provider.logoUrl ? (
                            <img 
                              src={provider.logoUrl} 
                              alt={provider.name} 
                              className="h-6 w-auto mr-2"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded bg-muted flex items-center justify-center mr-2">
                              {provider.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {providerListings?.count || 0} properties listed
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-md">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No booking sites connected yet
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    asChild
                  >
                    <Link to="/host/channel-manager">
                      Connect Now
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to="/host/channel-manager">
            Go to Channel Manager
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}