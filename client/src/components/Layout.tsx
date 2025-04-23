import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileActions from "./MobileActions";
import BookingModal from "./BookingModal";
import ListingWizard from "./ListingWizard";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [listingWizardOpen, setListingWizardOpen] = useState(false);

  const openBookingModal = (propertyId: number) => {
    setSelectedProperty(propertyId);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedProperty(null);
  };

  const openListingWizard = () => {
    setListingWizardOpen(true);
  };

  const closeListingWizard = () => {
    setListingWizardOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenListingWizard={openListingWizard} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <MobileActions />
      <BookingModal 
        open={bookingModalOpen} 
        onClose={closeBookingModal} 
        propertyId={selectedProperty} 
      />
      <ListingWizard 
        open={listingWizardOpen} 
        onClose={closeListingWizard} 
      />
    </div>
  );
}
