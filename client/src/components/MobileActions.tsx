import { useLocation } from "wouter";
import { Search, Heart, MessageSquare, User } from "lucide-react";

export default function MobileActions() {
  const [location, navigate] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around z-30">
      <button 
        className={`flex flex-col items-center ${location === "/" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
        onClick={() => navigate("/")}
      >
        <Search className="h-5 w-5" />
        <span className="text-xs mt-1">Explore</span>
      </button>
      <button 
        className={`flex flex-col items-center ${location === "/wishlist" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
        onClick={() => navigate("/wishlist")}
      >
        <Heart className="h-5 w-5" />
        <span className="text-xs mt-1">Wishlists</span>
      </button>
      <button 
        className={`flex flex-col items-center ${location === "/messages" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
        onClick={() => navigate("/messages")}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="text-xs mt-1">Messages</span>
      </button>
      <button 
        className={`flex flex-col items-center ${location === "/profile" ? "text-primary" : "text-slate-500 hover:text-primary"}`}
        onClick={() => navigate("/profile")}
      >
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );
}
