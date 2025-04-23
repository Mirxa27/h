import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Terms and Conditions
        </h1>
        <p className="text-lg text-gray-600">
          Last Updated: [Date]
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            By accessing or using the HabibiStay website and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, then you may not access the service.
          </p>
          <p>
            [Placeholder: Add detailed sections covering User Accounts, Property Listings, Bookings, Payments, Cancellations, User Conduct, Disclaimers, Limitation of Liability, Governing Law, Changes to Terms, Contact Information, etc.]
          </p>
           <p>
            This is a placeholder page. The full Terms and Conditions content needs to be added here.
          </p>
        </CardContent>
      </Card>

       {/* Add more Card sections for different policy parts as needed */}
       {/*
       <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Bookings and Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>[Details about booking process, payment terms, fees...]</p>
        </CardContent>
      </Card>
       */}

    </div>
  );
}
