import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, LineChart, DollarSign, TrendingUp, Calendar, Building2, Award } from "lucide-react";
import { SAR_SYMBOL } from '@/lib/constants';

// Sample data for demonstration
const performanceData = {
  occupancyRate: 85,
  averageDailyRate: 750,
  revenue: 4500000,
  properties: 120,
  investmentReturn: 22.5,
  marketGrowth: 18.2
};

// Sample chart component (placeholder)
const PerformanceChart = ({ type }: { type: 'bar' | 'line' }) => {
  return (
    <div className="h-[300px] w-full bg-muted/40 rounded-lg flex items-center justify-center">
      {type === 'bar' ? 
        <BarChart className="h-12 w-12 text-muted-foreground/50" /> : 
        <LineChart className="h-12 w-12 text-muted-foreground/50" />
      }
      <p className="ml-2 text-muted-foreground">Interactive chart would appear here</p>
    </div>
  );
};

export default function Investors() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Investor Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover investment opportunities and track your portfolio performance with HabibiStay's
          comprehensive property investment platform.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Average ROI
                </CardTitle>
                <CardDescription>Annual return on investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performanceData.investmentReturn}%</div>
                <p className="text-sm text-emerald-600">+2.5% from previous year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Properties
                </CardTitle>
                <CardDescription>Total properties in our network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performanceData.properties}</div>
                <p className="text-sm text-emerald-600">+15 properties this quarter</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Managed Revenue
                </CardTitle>
                <CardDescription>Total annual revenue (SAR)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{SAR_SYMBOL}{(performanceData.revenue / 1000000).toFixed(2)}M</div>
                <p className="text-sm text-emerald-600">+18.3% year-over-year</p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Market Performance (2024-2025)</CardTitle>
              <CardDescription>Revenue and occupancy trends year-to-date</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart type="line" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Invest with HabibiStay?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-full h-fit">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Proven Returns</h3>
                    <p className="text-muted-foreground text-sm">Our properties consistently outperform traditional real estate investments with average returns of 22.5%</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-full h-fit">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Premium Property Selection</h3>
                    <p className="text-muted-foreground text-sm">Carefully curated portfolio with properties in high-demand locations ensuring consistent occupancy</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-full h-fit">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Professional Management</h3>
                    <p className="text-muted-foreground text-sm">Full-service property management with AI-driven pricing optimization and marketing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Tourism Growth</h3>
                  <p className="text-muted-foreground text-sm mb-1">Saudi Arabia saw a 40% increase in international visitors in 2024, driving demand for short-term rentals.</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Vision 2030 Impact</h3>
                  <p className="text-muted-foreground text-sm mb-1">Government initiatives are accelerating real estate growth, with particular focus on tourism infrastructure.</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Property Value Appreciation</h3>
                  <p className="text-muted-foreground text-sm mb-1">Premium properties in key cities have shown 15-20% value appreciation annually.</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performanceData.occupancyRate}%</div>
                <p className="text-sm text-emerald-600">+5% above market average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Daily Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{SAR_SYMBOL}{performanceData.averageDailyRate}</div>
                <p className="text-sm text-emerald-600">+12% year-over-year</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Market Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{performanceData.marketGrowth}%</div>
                <p className="text-sm text-emerald-600">Trending upward</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Property Type</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart type="bar" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart type="line" />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Annual returns by investment tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Premium Tier</h3>
                    <span className="font-medium">24.8% ROI</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Standard Tier</h3>
                    <span className="font-medium">21.2% ROI</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">Value Tier</h3>
                    <span className="font-medium">18.5% ROI</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Premium Villa Package",
                location: "Diplomatic Quarter, Riyadh",
                price: "2.5M SAR",
                roi: "24.5%",
                image: "/assets/premium-villa.jpg",
                remaining: 3
              },
              {
                title: "Luxury Apartment Collection",
                location: "Al Olaya District, Riyadh", 
                price: "1.8M SAR",
                roi: "22.8%",
                image: "/assets/luxury-apartment.jpg",
                remaining: 5
              },
              {
                title: "Beachfront Property Portfolio",
                location: "Jeddah Waterfront",
                price: "3.2M SAR",
                roi: "26.2%",
                image: "/assets/beachfront.jpg",
                remaining: 2
              },
            ].map((opportunity, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {/* This would be an actual image in production */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    [Property Image]
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{opportunity.title}</CardTitle>
                      <CardDescription>{opportunity.location}</CardDescription>
                    </div>
                    <div className="bg-primary/10 px-2 py-1 rounded text-primary font-medium text-sm">
                      {opportunity.roi} ROI
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment:</p>
                      <p className="font-medium">{opportunity.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Units Available:</p>
                      <p className="font-medium">{opportunity.remaining}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Investment Options</CardTitle>
              <CardDescription>Choose the investment approach that suits your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Property Ownership</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Full ownership of premium properties with complete management services.</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> 100% ownership
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Full rental income
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Property appreciation
                      </li>
                    </ul>
                    <p className="font-medium mt-2">Minimum: 1.5M SAR</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardFooter>
                </Card>

                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded w-fit mb-2">POPULAR</div>
                    <CardTitle className="text-lg">Investment Pools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Invest in diversified property portfolios with fixed returns and lower entry points.</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Diversified portfolio
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Fixed annual returns
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Quarterly distributions
                      </li>
                    </ul>
                    <p className="font-medium mt-2">Minimum: 250K SAR</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Get Started</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Fractional Ownership</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">Own a share of premium properties with proportional benefits and usage rights.</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Partial ownership
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Personal usage periods
                      </li>
                      <li className="flex items-center">
                        <span className="text-primary mr-2">✓</span> Rental income share
                      </li>
                    </ul>
                    <p className="font-medium mt-2">Minimum: 500K SAR</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch with Our Investment Team</CardTitle>
              <CardDescription>
                Fill out the form below and one of our investment advisors will contact you to discuss opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="Your email" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input placeholder="Your phone number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Investment Budget</label>
                    <Input placeholder="Desired investment amount (SAR)" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Investment Interests</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Property Ownership', 'Investment Pools', 'Fractional Ownership', 'Multiple Properties', 'Luxury Villas', 'City Apartments'].map((interest, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input type="checkbox" id={`interest-${i}`} className="rounded" />
                        <label htmlFor={`interest-${i}`} className="text-sm">{interest}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea placeholder="Tell us about your investment goals" rows={4} />
                </div>
                
                <Button type="submit" className="w-full md:w-auto">Submit Inquiry</Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Advisory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our expert advisors provide personalized guidance to help you build a property portfolio 
                  that aligns with your financial goals.
                </p>
                <Button variant="outline" className="w-full">Schedule Consultation</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Private Investor Tours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Experience our premium properties firsthand with a guided tour, designed exclusively for 
                  potential investors.
                </p>
                <Button variant="outline" className="w-full">Book a Tour</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access our library of reports, market analyses, and investment guides to make informed 
                  decisions about the Saudi property market.
                </p>
                <Button variant="outline" className="w-full">View Resources</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}