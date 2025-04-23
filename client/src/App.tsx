import React from 'react';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PropertyDetails from "@/pages/PropertyDetails";
import Profile from "@/pages/Profile";
import Wishlist from "@/pages/Wishlist";
import Messages from "@/pages/Messages";
import BecomeHost from "@/pages/BecomeHost";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BookingSuccess from "@/pages/BookingSuccess";
import BookingError from "@/pages/BookingError";
import Layout from "@/components/Layout";
import SARA from "@/components/SARA";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import Investors from '@/pages/Investors';
import Properties from '@/pages/Properties';
import PropertiesByCategory from '@/pages/PropertiesByCategory';
import HostResources from '@/pages/HostResources';
import HostGuidelines from '@/pages/HostGuidelines';
import About from '@/pages/About';
import SuccessStories from '@/pages/SuccessStories';
import Blog from '@/pages/Blog';
import Contact from '@/pages/Contact';
import Support from '@/pages/Support';
import FAQ from '@/pages/FAQ';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Sitemap from '@/pages/Sitemap';
import ChannelManager from '@/pages/ChannelManager';
import ChannelProviderDetails from '@/pages/ChannelProviderDetails';

// Wrapper components to handle props properly
const HomeWrapper = () => <Home openBookingModal={() => {}} />;
const PropertyDetailsWrapper = ({ params }: { params: { id: string }}) => (
  <PropertyDetails openBookingModal={() => {}} />
);

function Router() {
  const { user } = useAuth();
  const [saraOpen, setSaraOpen] = useState(false);

  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomeWrapper} />
        <Route path="/properties" component={Properties} />
        <Route path="/properties/:category" component={PropertiesByCategory} />
        <Route path="/property/:id" component={PropertyDetailsWrapper} />
        <Route path="/profile" component={Profile} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/messages" component={Messages} />
        <Route path="/become-host" component={BecomeHost} />
        <Route path="/investors" component={Investors} />
        <Route path="/host-resources" component={HostResources} />
        <Route path="/host-guidelines" component={HostGuidelines} />
        <Route path="/about" component={About} />
        <Route path="/success-stories" component={SuccessStories} />
        <Route path="/blog" component={Blog} />
        <Route path="/contact" component={Contact} />
        <Route path="/support" component={Support} />
        <Route path="/faq" component={FAQ} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/sitemap" component={Sitemap} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/booking-success" component={BookingSuccess} />
        <Route path="/booking-error" component={BookingError} />
        {user?.isHost && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/host/channel-manager" component={ChannelManager} />
            <Route path="/host/channel-manager/:providerId" component={ChannelProviderDetails} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      <SARA />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
