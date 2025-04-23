
import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t mt-12 py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="text-primary font-bold text-2xl flex items-center gap-2 mb-4">
              HabibiStay
            </Link>
            <p className="text-slate-600 mb-6 max-w-md">
              Your trusted partner in Riyadh for exceptional stays, property management, and real estate investment opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-4">For Guests</h3>
            <ul className="space-y-3">
              <li><Link href="/properties" className="text-slate-600 hover:text-primary">Browse Stays</Link></li>
              <li><Link href="/blog" className="text-slate-600 hover:text-primary">Travel Blog</Link></li>
              <li><Link href="/faq" className="text-slate-600 hover:text-primary">Guest FAQ</Link></li>
              <li><Link href="/support" className="text-slate-600 hover:text-primary">Support Center</Link></li>
              <li><Link href="/guest-policies" className="text-slate-600 hover:text-primary">Guest Policies</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-4">For Hosts</h3>
            <ul className="space-y-3">
              <li><Link href="/become-host" className="text-slate-600 hover:text-primary">List Your Property</Link></li>
              <li><Link href="/host-resources" className="text-slate-600 hover:text-primary">Host Resources</Link></li>
              <li><Link href="/host-guidelines" className="text-slate-600 hover:text-primary">Hosting Guidelines</Link></li>
              <li><Link href="/host-support" className="text-slate-600 hover:text-primary">Host Support</Link></li>
              <li><Link href="/success-stories" className="text-slate-600 hover:text-primary">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-slate-600 hover:text-primary">About Us</Link></li>
              <li><Link href="/investors" className="text-slate-600 hover:text-primary">Investors</Link></li>
              <li><Link href="/careers" className="text-slate-600 hover:text-primary">Careers</Link></li>
              <li><Link href="/press" className="text-slate-600 hover:text-primary">Press Room</Link></li>
              <li><Link href="/contact" className="text-slate-600 hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} HabibiStay, Inc. All rights reserved.</p>
            <div className="flex space-x-4 mt-2">
              <Link href="/privacy" className="text-slate-500 hover:text-primary text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-500 hover:text-primary text-sm">Terms of Service</Link>
              <Link href="/sitemap" className="text-slate-500 hover:text-primary text-sm">Sitemap</Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Language:</span>
            <select className="text-sm border rounded px-2 py-1">
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
