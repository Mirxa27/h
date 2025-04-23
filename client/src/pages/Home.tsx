import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
import PropertyCard from "@/components/PropertyCard";
import { MapPin, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { SAR_SYMBOL } from "@/lib/constants";

interface HomeProps {
  openBookingModal?: (propertyId: number) => void;
}

export default function Home({ openBookingModal }: HomeProps) {
  const [location] = useLocation();
  const [filters, setFilters] = useState<Record<string, any>>({});
    
    const heroContent = {
      title: "HabibiStay: Where Exceptional Stays Meet Effortless Wealth",
      subtitle: "Experience luxury living in Riyadh while building your real estate portfolio",
      highlights: [
        {
          title: "For Guests",
          description: "Discover handpicked luxury properties with 5-star amenities and 24/7 concierge",
          stats: "4.9/5 average guest rating"
        },
        {
          title: "For Hosts",
          description: "Earn up to 40% more revenue with our AI-powered pricing and expert property management",
          stats: "95% occupancy rate"
        },
        {
          title: "For Investors",
          description: "Access exclusive high-yield real estate opportunities in prime Riyadh locations",
          stats: "15-20% annual ROI"
        }
      ]
    };
  
  // Extract search query from URL if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setFilters({ search: searchQuery });
    }
  }, [location]);
  
  // Build query string from filters
  const buildQueryString = () => {
    const queryParams = new URLSearchParams();
    
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice.toString());
    if (filters.bedrooms) queryParams.append("minBedrooms", filters.bedrooms.toString());
    if (filters.bathrooms) queryParams.append("minBathrooms", filters.bathrooms.toString());
    if (filters.minRating) queryParams.append("minRating", filters.minRating.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.amenities?.length > 0) {
      queryParams.append("amenities", filters.amenities.join(","));
    }
    
    return queryParams.toString();
  };

  // Fetch properties with filters
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: [`/api/properties?${buildQueryString()}`],
  });

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 mb-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{heroContent.title}</h1>
        <p className="text-xl mb-8">{heroContent.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6">
          {heroContent.highlights.map((highlight) => (
            <div key={highlight.title} className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
              <p className="mb-4">{highlight.description}</p>
              <div className="text-yellow-300 font-semibold">{highlight.stats}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Why Invest in Riyadh Real Estate?</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-emerald-600 mb-2">20%</div>
            <div className="text-gray-600">Average Property Value Growth (2023)</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 mb-2">$8.7B</div>
            <div className="text-gray-600">Real Estate Investment Volume</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">3.5M</div>
            <div className="text-gray-600">Tourist Arrivals in 2023</div>
          </div>
          <div className="bg-orange-50 p-6 rounded-xl">
            <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
            <div className="text-gray-600">Average Occupancy Rate</div>
          </div>
        </div>
      </div>
      <FilterBar onFilterChange={handleFilterChange} />
      
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Left side: Property listings */}
        <div className="w-full lg:w-7/12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {isLoading ? "Loading properties..." : 
                properties ? `${properties.length}+ stays${filters.search ? ` for "${filters.search}"` : ""}` : 
                "No properties found"}
            </h1>
            <div className="flex items-center">
              <button className="mr-4 text-sm text-slate-600 hover:text-primary">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Sort: Featured
              </button>
              <button className="hidden md:block text-sm text-slate-600 hover:text-primary">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                View
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : properties && properties.length > 0 ? (
            <>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  openBookingModal={openBookingModal || (() => {})}
                />
              ))}
              
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <Button variant="outline" className="px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-r-0 border-slate-300 rounded-l-md hover:bg-slate-50">
                    Previous
                  </Button>
                  <Button className="px-4 py-2 text-sm font-medium text-white border border-primary">
                    1
                  </Button>
                  <Button variant="outline" className="px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 hover:bg-slate-50">
                    2
                  </Button>
                  <Button variant="outline" className="px-4 py-2 text-sm font-medium text-slate-500 bg-white border border-l-0 border-slate-300 rounded-r-md hover:bg-slate-50">
                    Next
                  </Button>
                </nav>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-slate-500 text-lg">No properties found matching your criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilters({})}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Right side: Map view */}
        <div className="hidden lg:block lg:w-5/12 sticky top-36 h-[calc(100vh-144px)]">
          <div className="rounded-xl overflow-hidden h-full shadow-sm">
            <div className="bg-slate-200 w-full h-full relative" id="map">
              {/* Simple map representation */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 bg-cover">
                {/* Map representation - we'll use a placeholder with gradient since we don't have an actual map token */}
                {/* Map pins */}
                {properties?.map((property, index) => (
                  <div 
                    key={property.id}
                    className="absolute" 
                    style={{ 
                      top: `${25 + (index * 10)}%`, 
                      left: `${35 + (index * 10)}%` 
                    }}
                  >
                    <div 
                      className={`${index === 0 ? "bg-primary text-white" : "bg-white"} shadow-md rounded-full px-2 py-1 text-xs font-medium`}
                      onClick={() => openBookingModal && openBookingModal(property.id)}
                    >
                      {SAR_SYMBOL} {property.price}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Map overlay controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button size="icon" variant="default" className="w-10 h-10 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="default" className="w-10 h-10 rounded-full">
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
