import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

// Define sitemap structure
const sitemapSections = [
  {
    title: "Main Navigation",
    links: [
      { name: "Home", path: "/" },
      { name: "Properties", path: "/properties" },
      { name: "Become a Host", path: "/become-host" },
      { name: "Investors", path: "/investors" },
      { name: "About Us", path: "/about" },
      { name: "Success Stories", path: "/success-stories" },
      { name: "Blog", path: "/blog" },
      { name: "Contact Us", path: "/contact" },
    ]
  },
  {
    title: "User Account",
    links: [
      { name: "Login", path: "/login" },
      { name: "Register", path: "/register" },
      { name: "Profile", path: "/profile" }, // Requires login
      { name: "Wishlist", path: "/wishlist" }, // Requires login
      { name: "Messages", path: "/messages" }, // Requires login
      { name: "Dashboard", path: "/dashboard" }, // Requires host login
    ]
  },
  {
    title: "Information",
    links: [
      { name: "Support", path: "/support" },
      { name: "FAQ", path: "/faq" },
      { name: "Host Resources", path: "/host-resources" }, // Placeholder
      { name: "Host Guidelines", path: "/host-guidelines" }, // Placeholder
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms & Conditions", path: "/terms" },
    ]
  },
  // Add more sections if needed (e.g., Property Categories)
];

export default function Sitemap() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          Sitemap
        </h1>
        <p className="text-lg text-gray-600">
          Navigate through HabibiStay's website structure.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        {sitemapSections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl text-blue-800">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.path}>
                      <a className="text-blue-600 hover:text-blue-800 hover:underline">
                        {link.name}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
