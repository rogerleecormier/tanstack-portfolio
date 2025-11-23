import { Link } from '@tanstack/react-router';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Footer() {
  const footerSections = [
    {
      title: 'Navigation',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Portfolio', href: '/portfolio' },
      ],
    },
    {
      title: 'Work',
      links: [
        { label: 'Projects', href: '/projects' },
        { label: 'Blog & Insights', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ];

  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/rogerleecormier',
      icon: FaGithub,
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/rogerleecormier',
      icon: FaLinkedin,
    },
    {
      label: 'Twitter',
      href: 'https://twitter.com',
      icon: FaTwitter,
    },
  ];

  return (
    <footer className="border-t border-border-subtle bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {/* Newsletter Section */}
        <div className="mb-16">
          <NewsletterSignup
            variant="inline"
            title="Stay Updated"
            description="Get notified when new articles and projects are shared"
            placeholder="Enter your email"
            buttonText="Subscribe"
          />
        </div>

        {/* Footer Grid - 2 content columns + social column */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-foreground">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map(link => (
                  <Link
                    key={link.href}
                    to={link.href as any}
                    className="block text-sm text-text-secondary transition-colors hover:text-strategy-gold"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Social Links Column */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-foreground">
              Connect
            </h3>
            <div className="space-y-3">
              {socialLinks.map(link => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-strategy-gold"
                  >
                    <Icon size={14} />
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px bg-border-subtle" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs text-text-tertiary">
            © 2025 Roger Lee Cormier. Technical Strategist & Digital Innovator.
          </p>
        </div>
      </div>
    </footer>
  );
}
