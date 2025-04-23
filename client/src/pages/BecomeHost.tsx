import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, DollarSign, Star, Calendar, Shield, UserCheck } from "lucide-react";

export default function BecomeHost() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("why-host");

  // If user is logged in and already a host, redirect to dashboard
  if (user?.isHost) {
    navigate("/dashboard");
    return null;
  }

  const benefits = [
    {
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      title: "Earn extra income",
      description:
        "Turn your extra space into extra income and unlock new opportunities by hosting on HabibiStay.",
    },
    {
      icon: <Home className="h-10 w-10 text-primary" />,
      title: "Host from anywhere",
      description:
        "Manage your property remotely with our easy-to-use tools and dashboard designed for hosts.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Host with confidence",
      description:
        "You're protected with property damage protection and liability insurance.",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Tell us about your place",
      description:
        "Share some basic info, like where it is and how many guests can stay.",
    },
    {
      number: 2,
      title: "Make it stand out",
      description:
        "Add 5 or more photos plus a title and description—we'll help you out.",
    },
    {
      number: 3,
      title: "Finish up and publish",
      description:
        "Set a starting price, and get your space ready for bookings.",
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      // Open the listing wizard
      navigate("/dashboard");
    } else {
      // Redirect to registration
      navigate("/register");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h1 className="text-4xl font-bold mb-4">
            Become a Host on HabibiStay
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Join thousands of hosts sharing their spaces and earning extra income
            on HabibiStay.
          </p>
          <Button size="lg" onClick={handleGetStarted}>
            {user ? "Create your listing" : "Get started"}
          </Button>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Hosting on HabibiStay"
            className="w-full h-[400px] object-cover"
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why host on HabibiStay?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hosting Process */}
      <div className="mb-16 bg-slate-50 p-12 rounded-xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          How to get started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                {step.title}
              </h3>
              <p className="text-slate-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently asked questions
        </h2>
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-3xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="why-host">Why Host</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
          </TabsList>
          <TabsContent value="why-host" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Why should I host on HabibiStay?</CardTitle>
                <CardDescription>
                  Learn about the benefits of hosting your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    What are the benefits of hosting?
                  </h4>
                  <p className="text-slate-600">
                    Hosting on HabibiStay can help you earn extra income, meet
                    new people from around the world, and share your local
                    knowledge and culture.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    How much could I earn as a host?
                  </h4>
                  <p className="text-slate-600">
                    Earnings vary based on your location, property type,
                    amenities, and seasonal demand. Use our pricing tools to
                    optimize your earnings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="getting-started" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started as a Host</CardTitle>
                <CardDescription>
                  Everything you need to know to start hosting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    What do I need to get started?
                  </h4>
                  <p className="text-slate-600">
                    You'll need photos of your space, a description, and basic
                    amenities information. Our step-by-step process makes it
                    easy to set up your listing.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    Do I need permission to host?
                  </h4>
                  <p className="text-slate-600">
                    Depending on your location and property type, you may need
                    to check local regulations, HOA rules, or your lease
                    agreement before hosting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pricing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing and Fees</CardTitle>
                <CardDescription>
                  Understanding how pricing and fees work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    How should I price my listing?
                  </h4>
                  <p className="text-slate-600">
                    We provide pricing suggestions based on similar listings in
                    your area, demand, and seasonality. You always have final
                    control over your pricing.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    What fees does HabibiStay charge?
                  </h4>
                  <p className="text-slate-600">
                    HabibiStay typically charges hosts a 3% service fee for each
                    reservation. Guests pay a separate service fee ranging from
                    10-15%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="safety" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Safety and Protection</CardTitle>
                <CardDescription>
                  How we help keep hosts and their properties safe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    How does HabibiStay screen guests?
                  </h4>
                  <p className="text-slate-600">
                    We verify guest identity through various methods and provide
                    a review system so you can see feedback from other hosts
                    before accepting a booking.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    What happens if something goes wrong?
                  </h4>
                  <p className="text-slate-600">
                    Our Host Protection Insurance provides liability coverage up
                    to $1 million for every booking, and our Property Damage
                    Protection helps cover eligible damage.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-primary text-white p-12 rounded-xl mb-16">
        <h2 className="text-3xl font-bold mb-4">Ready to become a host?</h2>
        <p className="text-xl mb-6 max-w-2xl mx-auto">
          Join our community of hosts and start earning extra income by sharing
          your space with travelers from around the world.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="bg-white text-primary hover:bg-slate-100"
          onClick={handleGetStarted}
        >
          {user ? "Create your listing" : "Sign up to host"}
        </Button>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Hear from our hosts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah J.",
              location: "Dubai",
              quote:
                "Hosting on HabibiStay has allowed me to meet amazing people from around the world while earning extra income to pay for my mortgage.",
              rating: 5,
            },
            {
              name: "Mohammed A.",
              location: "Abu Dhabi",
              quote:
                "The platform is easy to use and the support team is always there when I need them. I've been hosting for 2 years and couldn't be happier!",
              rating: 5,
            },
            {
              name: "Lisa T.",
              location: "Riyadh",
              quote:
                "I started hosting my vacation home when I wasn't using it, and now it's generating income year-round. The smart pricing tool really helps.",
              rating: 4,
            },
          ].map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                </div>
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {testimonial.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Avatar component for testimonials
function Avatar({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-full bg-slate-100 flex items-center justify-center ${className}`}>{children}</div>;
}

function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <div className="text-slate-500 font-semibold">{children}</div>;
}
