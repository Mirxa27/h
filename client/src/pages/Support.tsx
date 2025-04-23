import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { LifeBuoy, MessageSquare, Phone } from 'lucide-react';

export default function Support() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          HabibiStay Support Center
        </h1>
        <p className="text-lg text-gray-600">
          We're here to help you with any questions or issues.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader className="items-center text-center">
            <LifeBuoy className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle className="text-2xl text-blue-800">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Find answers to common questions about booking, hosting, and more.</p>
            <Link href="/faq">
              <Button variant="outline">Visit FAQ</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center text-center">
            <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle className="text-2xl text-blue-800">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Send us a message or start a live chat for direct assistance.</p>
            <Link href="/contact">
              <Button variant="outline">Contact Page</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center text-center">
            <Phone className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle className="text-2xl text-blue-800">Call Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Speak directly with our support team for urgent matters.</p>
            <a href="tel:+966550800669">
              <Button variant="outline">+966-55-0800-669</Button>
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Placeholder for additional support resources if needed */}
      {/*
      <section>
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">More Resources</h2>
        <div className="text-center text-gray-600">
          <p>Links to guides, policies, etc.</p>
        </div>
      </section>
      */}
    </div>
  );
}
