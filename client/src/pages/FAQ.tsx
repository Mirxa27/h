import React from 'react'; // Added React import
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button"; // Ensured Button import is present

// Placeholder FAQ data - replace with actual questions and answers
const faqItems = [
  {
    id: "item-1",
    question: "How do I book a property?",
    answer: "You can search for properties using the search bar on the home page or the 'For Guests' section. Select your desired dates and number of guests, browse the available properties, and click 'Book Now' on the property you like. Follow the steps to complete your booking and payment."
  },
  {
    id: "item-2",
    question: "What payment methods do you accept?",
    answer: "We currently accept payments through MyFatoorah, which supports various local and international payment methods including credit cards and debit cards. We plan to add more options like PayPal in the future."
  },
  {
    id: "item-3",
    question: "How can I list my property on HabibiStay?",
    answer: "Visit the 'For Property Owners' section and click on 'List Your Property' or 'Partner with Us'. You'll be guided through a simple process to create an account and provide details about your property, including photos, amenities, pricing, and availability."
  },
  {
    id: "item-4",
    question: "What are the benefits for investors?",
    answer: "HabibiStay offers opportunities for both capital investors seeking steady returns and international investors looking to own and profit from Riyadh properties managed by us. We provide transparent reporting and handle all aspects of property management."
  },
  {
    id: "item-5",
    question: "What is your cancellation policy?",
    answer: "Cancellation policies vary depending on the property and the host's settings. You can find the specific cancellation policy for each property on its listing page before booking. Generally, policies range from flexible to strict."
  },
  // Add more FAQ items as needed
];

export default function FAQ() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600">
          Find answers to common questions about HabibiStay.
        </p>
      </section>

      <section className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-lg text-left hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="text-center mt-12">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Still have questions?</h2>
        <p className="text-gray-600 mb-6">Contact our support team for further assistance.</p>
        <a href="/contact">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            Contact Support
          </Button>
        </a>
      </section>
    </div>
  );
}
