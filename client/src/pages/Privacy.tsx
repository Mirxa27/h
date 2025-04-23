import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600">
          Last Updated: [Date]
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            Welcome to HabibiStay's Privacy Policy. Your privacy is critically important to us. This policy outlines how we collect, use, protect, and handle your personal information as you use our website and services.
          </p>
          <p>
            [Placeholder: Add detailed sections about Information Collection, Use of Information, Data Sharing, Data Security, Cookies, User Rights, Policy Updates, Contact Information, etc.]
          </p>
           <p>
            This is a placeholder page. The full Privacy Policy content needs to be added here, detailing compliance with relevant regulations (e.g., GDPR, local Saudi laws).
          </p>
        </CardContent>
      </Card>

       {/* Add more Card sections for different policy parts as needed */}
       {/*
       <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>[Details about types of data collected...]</p>
        </CardContent>
      </Card>
       */}

    </div>
  );
}
