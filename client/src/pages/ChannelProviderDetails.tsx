import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, ChevronLeft, Settings, RefreshCw, LinkIcon, UnlinkIcon, HelpCircle, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

const credentialSchema = z.object({
  apiKey: z.string().min(1, { message: "API Key is required" }),
  apiSecret: z.string().min(1, { message: "API Secret is required" }),
  accountId: z.string().optional(),
});

export default function ChannelProviderDetails() {
  const { providerId } = useParams();
  const id = parseInt(providerId);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isEditCredentialOpen, setIsEditCredentialOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: provider, isLoading: providerLoading } = useQuery({
    queryKey: ['/api/channel-providers', id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/channel-providers/${id}`);
      if (!res.ok) throw new Error('Failed to fetch provider');
      return await res.json() as ChannelProvider;
    },
    enabled: !isNaN(id)
  });

  const { data: credential, isLoading: credentialLoading } = useQuery({
    queryKey: ['/api/channel-credentials', id],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/channel-credentials');
      if (!res.ok) return null;
      const credentials = await res.json() as ChannelCredential[];
      return credentials.find(cred => cred.providerId === id) || null;
    },
    enabled: !isNaN(id)
  });

  const form = useForm<z.infer<typeof credentialSchema>>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      apiKey: credential?.apiKey || '',
      apiSecret: credential?.apiSecret || '',
      accountId: credential?.accountId || '',
    },
  });

  // Update form when credential data loads
  useEffect(() => {
    if (credential) {
      form.reset({
        apiKey: credential.apiKey,
        apiSecret: credential.apiSecret,
        accountId: credential.accountId || '',
      });
    }
  }, [credential, form]);

  const updateCredentialMutation = useMutation({
    mutationFn: async (data: z.infer<typeof credentialSchema>) => {
      if (!credential) {
        // Create new credential
        const res = await apiRequest('POST', '/api/channel-credentials', {
          ...data,
          providerId: id,
        });
        return res.json();
      } else {
        // Update existing credential
        const res = await apiRequest('PUT', `/api/channel-credentials/${credential.id}`, data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channel-credentials'] });
      setIsEditCredentialOpen(false);
      toast({
        title: credential ? "Credentials Updated" : "Connection Established",
        description: credential 
          ? "Your API credentials have been updated successfully." 
          : `You've successfully connected to ${provider?.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update credentials. Please try again.",
        variant: "destructive",
      });
    }
  });

  const verifyCredentialMutation = useMutation({
    mutationFn: async () => {
      if (!credential) throw new Error('No credential to verify');
      const res = await apiRequest('POST', `/api/channel-credentials/${credential.id}/verify`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channel-credentials'] });
      toast({
        title: "Verification Successful",
        description: "Your API credentials have been verified and are working correctly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: "We couldn't verify your credentials. Please check them and try again.",
        variant: "destructive",
      });
    }
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: async () => {
      if (!credential) throw new Error('No credential to delete');
      const res = await apiRequest('DELETE', `/api/channel-credentials/${credential.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channel-credentials'] });
      toast({
        title: "Connection Removed",
        description: `You've successfully disconnected from ${provider?.name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove connection. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof credentialSchema>) => {
    updateCredentialMutation.mutate(data);
  };

  const handleDisconnect = () => {
    if (confirm(`Are you sure you want to disconnect from ${provider?.name}? This will remove all associated listings and data.`)) {
      deleteCredentialMutation.mutate();
    }
  };

  if (providerLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Provider Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The booking site provider you're looking for doesn't exist or isn't available.
          </p>
          <Button asChild>
            <Link to="/host/channel-manager">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Channel Manager
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/host/channel-manager">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Channel Manager
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center">
          {provider.logoUrl ? (
            <img 
              src={provider.logoUrl} 
              alt={provider.name} 
              className="h-12 mr-4"
            />
          ) : (
            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-lg font-bold mr-4">
              {provider.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{provider.name}</h1>
            <div className="flex items-center mt-1">
              {credential ? (
                credential.isVerified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                  Not Connected
                </Badge>
              )}
              {!provider.isActive && (
                <Badge variant="outline" className="ml-2">Coming Soon</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {credential ? (
            <>
              <Button 
                variant="outline"
                onClick={() => setIsEditCredentialOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Connection
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDisconnect}
                disabled={deleteCredentialMutation.isPending}
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
              onClick={() => setIsEditCredentialOpen(true)}
              disabled={!provider.isActive}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {credential && (
            <>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {provider.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {provider.name} is one of the world's leading online travel agencies, 
                    connecting millions of travelers with accommodations around the globe. 
                    By integrating with {provider.name}, you can expand your property's 
                    visibility and attract guests from their extensive user base.
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Key Benefits</h3>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Reach millions of potential guests</li>
                        <li>Automatic calendar synchronization</li>
                        <li>Manage bookings in one place</li>
                        <li>Access to market insights</li>
                      </ul>
                    </div>
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Requirements</h3>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        <li>Valid API credentials</li>
                        <li>Active {provider.name} account</li>
                        <li>Properties that meet platform standards</li>
                        <li>Proper licensing and permits</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Common Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        How do I get API credentials for {provider.name}?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">
                          To obtain API credentials, log in to your {provider.name} extranet or partner dashboard. 
                          Navigate to the API or Connectivity section and follow the instructions to generate 
                          your API key and secret. If you don't have a partner account yet, you'll need to 
                          register as a connectivity partner first.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        What happens if I disconnect from {provider.name}?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">
                          When you disconnect, we'll remove your API credentials from our system. Your listings 
                          on {provider.name} will remain active, but you'll no longer be able to manage them 
                          through our channel manager. Any existing bookings will need to be managed directly 
                          through {provider.name}.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        Does {provider.name} charge any fees for API access?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">
                          {provider.name} typically charges a commission on bookings made through their platform, 
                          but access to their API is usually free for property managers and channel managers. 
                          Be sure to review their current terms and conditions for any potential changes to their 
                          fee structure.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>
                        How often is availability and pricing synced?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">
                          By default, we sync availability and pricing every hour. You can also trigger manual 
                          syncs at any time. For properties with rapidly changing availability or pricing, we 
                          recommend scheduling more frequent automatic syncs in the settings tab.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {credential ? (
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${credential.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="font-medium">
                          {credential.isVerified ? 'Connected' : 'Connected (Unverified)'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-2">
                        <div className="flex justify-between">
                          <span>Connection Date:</span>
                          <span>{new Date(credential.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Verified:</span>
                          <span>{credential.isVerified ? new Date(credential.updatedAt).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => verifyCredentialMutation.mutate()}
                        disabled={verifyCredentialMutation.isPending}
                      >
                        {verifyCredentialMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Verify Connection
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="font-medium mb-2">Not Connected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You haven't connected to {provider.name} yet. 
                        Connect to start managing your listings.
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setIsEditCredentialOpen(true)}
                        disabled={!provider.isActive}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium mb-1">Support Resources</h3>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <a href="#" className="hover:underline">Integration Guide</a>
                        </li>
                        <li className="flex items-center">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <a href="#" className="hover:underline">API Documentation</a>
                        </li>
                        <li className="flex items-center">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <a href="#" className="hover:underline">Troubleshooting FAQ</a>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h3 className="font-medium mb-1">Contact Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Need help with your {provider.name} integration?
                      </p>
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link to="/host/support">Contact Support</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {credential && (
          <>
            <TabsContent value="settings" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Synchronization Settings</CardTitle>
                      <CardDescription>
                        Control how your properties sync with {provider.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Auto-sync frequency</h3>
                            <p className="text-sm text-muted-foreground">
                              How often to automatically sync availability and rates
                            </p>
                          </div>
                          <div>
                            <select className="border rounded-md px-3 py-1.5 text-sm">
                              <option value="15">Every 15 minutes</option>
                              <option value="30">Every 30 minutes</option>
                              <option value="60" selected>Every hour</option>
                              <option value="120">Every 2 hours</option>
                              <option value="360">Every 6 hours</option>
                              <option value="720">Every 12 hours</option>
                              <option value="1440">Once per day</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Synchronize reservations</h3>
                            <p className="text-sm text-muted-foreground">
                              Import bookings from {provider.name} automatically
                            </p>
                          </div>
                          <Switch checked={true} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Synchronize guest data</h3>
                            <p className="text-sm text-muted-foreground">
                              Import guest details with reservations
                            </p>
                          </div>
                          <Switch checked={true} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Rate synchronization</h3>
                            <p className="text-sm text-muted-foreground">
                              Automatically update rates when changed in HabibiStay
                            </p>
                          </div>
                          <Switch checked={true} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Availability synchronization</h3>
                            <p className="text-sm text-muted-foreground">
                              Automatically update availability when changed in HabibiStay
                            </p>
                          </div>
                          <Switch checked={true} />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Button>Save Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button className="w-full" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync All Listings Now
                      </Button>
                      
                      <Button className="w-full" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync All Reservations
                      </Button>
                      
                      <Alert className="mt-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Important Note</AlertTitle>
                        <AlertDescription className="text-xs">
                          Manual synchronization may take several minutes to complete, 
                          depending on the number of properties and the current 
                          {provider.name} API response times.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>API Credentials</CardTitle>
                      <CardDescription>
                        Manage your {provider.name} API credentials
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-medium">API Key</label>
                          <div className="flex mt-1.5">
                            <Input 
                              value="••••••••••••••••••••••••••••••" 
                              disabled 
                              className="rounded-r-none" 
                            />
                            <Button variant="outline" className="rounded-l-none">
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">API Secret</label>
                          <div className="flex mt-1.5">
                            <Input 
                              value="••••••••••••••••••••••••••••••" 
                              disabled 
                              className="rounded-r-none" 
                            />
                            <Button variant="outline" className="rounded-l-none">
                              View
                            </Button>
                          </div>
                        </div>
                        
                        {credential.accountId && (
                          <div>
                            <label className="text-sm font-medium">Account ID</label>
                            <div className="flex mt-1.5">
                              <Input 
                                value={credential.accountId} 
                                disabled 
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <Button onClick={() => setIsEditCredentialOpen(true)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Update Credentials
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-md border p-3">
                          <div className="flex items-start mb-2">
                            <Shield className="h-4 w-4 mt-0.5 mr-2 text-primary" />
                            <h3 className="font-medium">How we protect your data</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your API credentials are encrypted and securely stored. 
                            We use industry-standard security practices to protect your data.
                          </p>
                        </div>
                        
                        <div className="rounded-md border p-3">
                          <div className="flex items-start mb-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 text-yellow-500" />
                            <h3 className="font-medium">Important security tips</h3>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                            <li>Never share your API credentials with anyone</li>
                            <li>Regularly update your API keys</li>
                            <li>Use strong, unique passwords for your {provider.name} account</li>
                            <li>Enable two-factor authentication if available</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Edit Credential Dialog */}
      <Dialog open={isEditCredentialOpen} onOpenChange={setIsEditCredentialOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {credential ? "Update API Credentials" : "Connect to " + provider.name}
            </DialogTitle>
            <DialogDescription>
              {credential 
                ? "Update your API credentials for " + provider.name
                : "Enter your API credentials to connect to " + provider.name}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your API key" {...field} />
                    </FormControl>
                    <FormDescription>
                      The API key provided by {provider.name}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
                      The API secret or password provided by {provider.name}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account ID (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your account ID" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Some booking sites require an account ID or username
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Where to find your credentials</AlertTitle>
                <AlertDescription className="text-xs">
                  You can find your API credentials in your {provider.name} extranet or partner dashboard. 
                  Look for the API or Channel Manager section in your account settings.
                </AlertDescription>
              </Alert>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditCredentialOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateCredentialMutation.isPending}
                >
                  {updateCredentialMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {credential ? "Update" : "Connect"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}