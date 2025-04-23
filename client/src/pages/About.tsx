import React from "react";
import { Button } from "@/components/ui/button";
import brandColors from "@/lib/brandColors";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-brand py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
            <p className="text-xl mb-8">
              Connecting travelers with authentic Middle Eastern hospitality while empowering local hosts to showcase their properties to a global audience.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
                <p className="text-lg mb-4 text-gray-600">
                  Founded in 2022, HabibiStay was born from a simple idea: to bridge the gap between Middle Eastern hospitality and modern travel expectations.
                </p>
                <p className="text-lg mb-6 text-gray-600">
                  We saw an opportunity to create a platform that celebrates the rich cultural heritage of the Middle East while providing travelers with comfortable, safe, and authentic accommodation options.
                </p>
                <p className="text-lg text-gray-600">
                  Today, we're proud to offer thousands of properties across the region, from luxury penthouses in Dubai to traditional riads in Morocco, all supported by our cutting-edge technology and unmatched customer service.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/workspaces/h/attached_assets/image_1745379090466.png"
                  alt="HabibiStay Story"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={brandColors.primary.DEFAULT}
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Authentic Hospitality</h3>
                <p className="text-gray-600 text-center">
                  We believe in preserving and showcasing the legendary Middle Eastern tradition of hospitality, where guests are treated like family.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={brandColors.primary.DEFAULT}
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Community Empowerment</h3>
                <p className="text-gray-600 text-center">
                  We're dedicated to supporting local economies by enabling property owners to succeed in the global hospitality marketplace.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={brandColors.primary.DEFAULT}
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">Trust & Safety</h3>
                <p className="text-gray-600 text-center">
                  We prioritize the security of our users through rigorous verification processes, 24/7 support, and advanced platform safeguards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/workspaces/h/attached_assets/Abdullah.png"
                  alt="Abdullah Al-Faisal"
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Abdullah Al-Faisal</h3>
                  <p className="text-primary-600 font-medium mb-3">CEO & Co-Founder</p>
                  <p className="text-gray-600">
                    Former hospitality executive with 15+ years of experience in luxury hotels across the Middle East, passionate about elevating regional tourism.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/workspaces/h/attached_assets/Anna.png"
                  alt="Anna Petrov"
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Anna Petrov</h3>
                  <p className="text-primary-600 font-medium mb-3">CTO & Co-Founder</p>
                  <p className="text-gray-600">
                    Tech visionary who led development teams at major tech companies before co-founding HabibiStay to revolutionize travel tech in the region.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/workspaces/h/attached_assets/Vladimir.png"
                  alt="Vladimir Kowalski"
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Vladimir Kowalski</h3>
                  <p className="text-primary-600 font-medium mb-3">Head of Operations</p>
                  <p className="text-gray-600">
                    Operations expert with a background in scaling marketplace platforms, ensuring smooth experiences for both hosts and guests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-gradient-brand text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the HabibiStay Community</h2>
            <p className="text-xl mb-8">
              Whether you're looking for your next unforgettable stay or ready to share your property with travelers from around the world, we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary">
                Find a Stay
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Become a Host
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
