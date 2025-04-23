import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter'; // Assuming wouter is used for routing

// Placeholder data for featured blog posts
const featuredPosts = [
  {
    id: 1,
    title: "Top 5 Reasons to Visit Riyadh This Year",
    description: "Discover why Riyadh is becoming a must-visit destination for travelers worldwide.",
    imageUrl: "/placeholder-riyadh.jpg", // Replace with actual image URL
    slug: "/blog/top-5-reasons-riyadh" // Example slug
  },
  {
    id: 2,
    title: "How to Make Your Property a Guest Favorite",
    description: "Tips and tricks for hosts to delight guests and earn rave reviews.",
    imageUrl: "/placeholder-property.jpg", // Replace with actual image URL
    slug: "/blog/guest-favorite-property" // Example slug
  },
  {
    id: 3,
    title: "Why Riyadh Is the Next Big Investment Hub",
    description: "An inside look at the booming real estate market in Saudi Arabia's capital.",
    imageUrl: "/placeholder-investment.jpg", // Replace with actual image URL
    slug: "/blog/riyadh-investment-hub" // Example slug
  }
];

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Stay Inspired with HabibiStay Insights
        </h1>
        <p className="text-lg text-gray-600">News, tips, and stories from the HabibiStay team.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-blue-800 mb-8">Featured Posts</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{post.description}</CardDescription>
              </CardContent>
              <CardFooter>
                {/* TODO: Link to actual blog post page when created */}
                <Link href={post.slug}>
                  <Button variant="link" className="p-0 text-blue-600 hover:text-blue-800">Read More</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center">
         {/* TODO: Link to a full blog listing page when created */}
        <Link href="/blog/all">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Read More Posts
            </Button>
        </Link>
      </section>
    </div>
  );
}
