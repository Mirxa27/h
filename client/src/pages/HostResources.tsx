import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { BookOpen, Lightbulb, ShieldCheck } from 'lucide-react';

export default function HostResources() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Host Resources
        </h1>
        <p className="text-lg text-gray-600">
          Guides, tips, and tools to help you succeed as a HabibiStay host.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
         <Card>
          <CardHeader className="items-center text-center">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle className="text-2xl text-blue-800">Hosting Guides</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Learn best practices for listing creation, guest communication, and property maintenance.</p>
            {/* TODO: Link to actual guides */}
            <Link href="/host-guides/getting-started">
                <a className="text-blue-600 hover:underline">Getting Started Guide</a>
            </Link>
          </CardContent>
        </Card>

         <Card>
          <CardHeader className="items-center text-center">
            <Lightbulb className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle className="text-2xl text-blue-800">Tips & Tricks</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Optimize your listing, pricing strategy, and guest experience for better reviews and income.</p>
             {/* TODO: Link to actual tips */}
            <Link href="/blog/category/hosting-tips">
                <a className="text-blue-600 hover:underline">Read Hosting Tips</a>
            </Link>
          </CardContent>
        </Card>

         <Card>
          <CardHeader className="items-center text-center">
            <ShieldCheck className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle className="text-2xl text-blue-800">Policies & Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Understand our community standards, safety protocols, and hosting requirements.</p>
            <Link href="/host-guidelines">
                <a className="text-blue-600 hover:underline">View Host Guidelines</a>
            </Link>
          </CardContent>
        </Card>
      </section>

       {/* Placeholder for additional resources */}
       <section className="mt-12 text-center">
         <h2 className="text-2xl font-semibold text-blue-800 mb-4">More Coming Soon</h2>
         <p className="text-gray-600">We are constantly adding new resources to help our hosts thrive.</p>
       </section>
    </div>
  );
}
