import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming Avatar is used for client photos

// Placeholder images - replace with actual paths or URLs
const ahmedPhotoUrl = "/placeholder-ahmed.jpg"; // Replace
const fatimaPhotoUrl = "/placeholder-fatima.jpg"; // Replace
const carlosPhotoUrl = "/placeholder-carlos.jpg"; // Replace

const stories = [
  {
    name: "Ahmed",
    role: "Property Owner",
    quote: "HabibiStay turned my headaches into profits—best decision I made!",
    imageUrl: ahmedPhotoUrl,
    fallback: "AH"
  },
  {
    name: "Fatima",
    role: "Investor",
    quote: "A secure, rewarding investment I trust completely.",
    imageUrl: fatimaPhotoUrl,
    fallback: "FA"
  },
  {
    name: "Carlos",
    role: "Guest",
    quote: "Every stay feels special with HabibiStay!",
    imageUrl: carlosPhotoUrl,
    fallback: "CA"
  }
];

export default function SuccessStories() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Real People, Real Results
        </h1>
        <p className="text-lg text-gray-600">Hear from our satisfied clients.</p>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12">
        {stories.map((story, index) => (
          <Card key={index} className="flex flex-col items-center text-center p-6">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={story.imageUrl} alt={story.name} />
              <AvatarFallback>{story.fallback}</AvatarFallback>
            </Avatar>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-blue-800">{story.name}</CardTitle>
              <p className="text-sm text-gray-500">{story.role}</p>
            </CardHeader>
            <CardContent className="text-gray-700 italic flex-grow">
              <p>"{story.quote}"</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Share Your HabibiStay Story</h2>
        <p className="text-gray-600 mb-6">We'd love to hear about your experience!</p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          Share Your Story
        </Button>
        {/* TODO: Implement functionality for sharing stories (e.g., link to a form or contact page) */}
      </section>
    </div>
  );
}
