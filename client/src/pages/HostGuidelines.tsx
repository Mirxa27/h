import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function HostGuidelines() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Host Guidelines
        </h1>
        <p className="text-lg text-gray-600">
          Our community standards for safe and successful hosting.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Our Commitment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p>
            At HabibiStay, we strive to create a trusted community for guests and hosts. These guidelines outline the standards we expect all hosts to adhere to, ensuring safety, reliability, and positive experiences for everyone.
          </p>
          <p>
            [Placeholder: Add detailed sections covering Safety, Cleanliness, Accuracy, Communication, Check-in/Check-out Procedures, House Rules, Non-discrimination, Compliance with Laws, etc.]
          </p>
           <p>
            This is a placeholder page. The full Host Guidelines content needs to be added here.
          </p>
        </CardContent>
      </Card>

       {/* Example Guideline Section */}
       <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-800">Key Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
           <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span>Maintain a safe and clean environment for guests.</span>
            </div>
             <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span>Provide accurate listing details, photos, and amenity information.</span>
            </div>
             <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span>Communicate promptly and professionally with guests.</span>
            </div>
             <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span>Respect guest privacy and adhere to HabibiStay's non-discrimination policy.</span>
            </div>
             <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span>Comply with all local laws and regulations regarding short-term rentals.</span>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
