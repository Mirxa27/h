import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, User, CircleHelp, Search } from "lucide-react";

interface HeaderProps {
  onOpenListingWizard: () => void;
}

export default function Header({ onOpenListingWizard }: HeaderProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-primary font-bold text-2xl flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              <span>HabibiStay</span>
            </Link>
          </div>

          {/* Search Bar (desktop) */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for places to stay..."
                className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Find Stays
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate("/properties")}>Browse All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/properties/luxury")}>Luxury Stays</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/properties/business")}>Business Travel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Host & Invest
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate("/become-host")}>Become a Host</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/investors")}>Investment Options</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/host-resources")}>Host Resources</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                About
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate("/about")}>Our Story</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/success-stories")}>Success Stories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/blog")}>Blog</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/contact" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Contact
            </Link>

            {user?.isHost && (
              <Link href="/dashboard" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
            )}

            {/* Help dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-slate-600 hover:text-primary focus:outline-none">
                  <span className="hidden sm:block mr-2">Help</span>
                  <CircleHelp className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Contact Support</DropdownMenuItem>
                <DropdownMenuItem>FAQs</DropdownMenuItem>
                <DropdownMenuItem>How it Works</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center p-1 border-2 border-slate-300 rounded-full hover:shadow focus:outline-none">
                  {user?.profileImage ? (
                    <img
                      className="h-6 w-6 rounded-full"
                      src={user.profileImage}
                      alt="User profile"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Your Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Your Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                      Wishlists
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")}>
                      Messages
                    </DropdownMenuItem>
                    {!user.isHost && (
                      <DropdownMenuItem onClick={onOpenListingWizard}>
                        Switch to Hosting
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/login")}>
                      Log In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/register")}>
                      Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Search Bar (mobile) */}
        <div className="block md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search for places to stay..."
              className="w-full py-2 pl-10 pr-4 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
