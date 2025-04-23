import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Placeholder images - replace with actual paths or URLs if available
const teamPhotoUrl = "/placeholder-team.jpg"; // Replace with actual team photo URL
const abdullahPhotoUrl = "/attached_assets/Abdullah.png"; // Assuming image is accessible
const vladimirPhotoUrl = "/attached_assets/Vladimir.png"; // Assuming image is accessible
const annaPhotoUrl = "/attached_assets/Anna.png"; // Assuming image is accessible


export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12 py-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Welcome to HabibiStay: Where Trust Meets Opportunity
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          We’re passionate about creating exceptional stays and unlocking wealth for our community.
        </p>
        {/* Optional: Add a relevant image here if desired */}
        {/* <img src={teamPhotoUrl} alt="HabibiStay Team" className="mt-8 mx-auto rounded-lg shadow-md max-w-lg w-full" /> */}
      </section>

      {/* Our Story Section */}
      <section className="mb-16">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-3xl text-blue-800">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 text-lg leading-relaxed">
            <p>
              Born in Riyadh, HabibiStay blends local expertise with a global vision. Our mission is to make property ownership and investment effortless, while giving guests unforgettable experiences. With a team of real estate and hospitality veterans, we’re here to build lasting partnerships you can rely on.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Our Values Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-blue-700">Trust</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Honest, open relationships with every client.
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-blue-700">Excellence</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Top-quality service in every detail.
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-blue-700">Growth</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Turning opportunities into success for all.
            </CardContent>
          </Card>
        </div>
        {/* Optional CTA: <div className="text-center mt-8"><Button>Meet Our Team</Button></div> */}
      </section>

      {/* Meet Our Founders Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">Meet Our Founders</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Abdullah Mirza */}
          <Card className="flex flex-col items-center text-center">
            <CardHeader>
              <Avatar className="w-24 h-24 mb-4 mx-auto">
                <AvatarImage src={abdullahPhotoUrl} alt="Mr. Abdullah Mirza" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-blue-900">Mr. Abdullah Mirza</CardTitle>
              <p className="text-sm text-gray-500">Co-Founder</p>
            </CardHeader>
            <CardContent className="text-gray-600 flex-grow">
              <p>
                Abdullah is our tech visionary, blending over a decade of AI expertise with a deep love for real estate innovation. He’s the heartbeat of our cutting-edge platform, ensuring it’s as intuitive as it is powerful. When he’s not shaping the future of property management, you might find him exploring Riyadh’s hidden gems—always dreaming up ways to make HabibiStay even better for you.
              </p>
            </CardContent>
          </Card>

          {/* Vladimir Radchenko */}
          <Card className="flex flex-col items-center text-center">
            <CardHeader>
              <Avatar className="w-24 h-24 mb-4 mx-auto">
                <AvatarImage src={vladimirPhotoUrl} alt="Vladimir Radchenko" />
                <AvatarFallback>VR</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-blue-900">Vladimir Radchenko</CardTitle>
              <p className="text-sm text-gray-500">Co-Founder</p>
            </CardHeader>
            <CardContent className="text-gray-600 flex-grow">
              <p>
                Vladimir is our financial maestro, with a sharp eye for opportunity and a knack for turning investments into lasting wealth. His years of experience mean your returns are not just promising—they’re secure. A trusted guide for our investors, Vladimir’s calm confidence ensures HabibiStay is a safe harbor for your financial goals, no matter where you’re starting from.
              </p>
            </CardContent>
          </Card>

          {/* Anna Miroshenchinko */}
          <Card className="flex flex-col items-center text-center">
            <CardHeader>
              <Avatar className="w-24 h-24 mb-4 mx-auto">
                <AvatarImage src={annaPhotoUrl} alt="Anna Miroshenchinko" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-blue-900">Anna Miroshenchinko</CardTitle>
              <p className="text-sm text-gray-500">Co-Founder</p>
            </CardHeader>
            <CardContent className="text-gray-600 flex-grow">
              <p>
                Anna is the creative soul of HabibiStay, weaving exceptional experiences into every stay, partnership, and investment. With her keen sense of hospitality and design, she transforms properties into welcoming havens and opportunities into successes. Anna’s mission? To make every moment with HabibiStay feel personal, memorable, and effortlessly delightful.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
