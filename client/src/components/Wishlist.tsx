import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Wishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([
    { id: 1, title: "Luxury Beachfront Villa", location: "Malibu, CA" },
  ]);

  const handleRemove = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleShare = () => {
    const wishlistTitles = wishlist.map((item) => item.title).join(", ");
    alert(`Sharing wishlist: ${wishlistTitles}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>

      {wishlist.length > 0 ? (
        <div className="space-y-4">
          {wishlist.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-slate-500">{item.location}</p>
              </div>
              <Button variant="outline" onClick={() => handleRemove(item.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">Your wishlist is empty.</p>
      )}

      {wishlist.length > 0 && (
        <Button className="mt-4" onClick={handleShare}>
          Share Wishlist
        </Button>
      )}
    </div>
  );
}