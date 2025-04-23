import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // TODO: Implement actual form submission logic (e.g., send to backend API)
    console.log('Contact form submitted:', data);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    reset(); // Reset form fields after successful submission
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          We’re Here for You—Let’s Connect
        </h1>
        <p className="text-lg text-gray-600">
          Questions? Ideas? Reach out anytime.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Details Section */}
        <section>
          <h2 className="text-3xl font-bold text-blue-800 mb-6">Contact Details</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-600" />
              <span>+966-55-0800-669</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>info@habibistay.com</span>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1" />
              <span>Riyadh, Saudi Arabia</span>
            </div>
            <div className="flex items-center space-x-3 pt-4">
               {/* TODO: Implement Live Chat functionality */}
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                Chat with us now!
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section>
           <Card>
             <CardHeader>
                <CardTitle className="text-2xl text-blue-800">Send Us a Message</CardTitle>
             </CardHeader>
             <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register('name')} placeholder="Your Name" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="Your Email Address" />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" {...register('message')} placeholder="Your Message" rows={5} />
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Send Message
                  </Button>
                </form>
             </CardContent>
           </Card>
        </section>
      </div>
    </div>
  );
}
