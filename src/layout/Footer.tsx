import { MapPin, Mail, ExternalLink, Heart } from 'lucide-react'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { H3, H4, P } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-teal-800 via-teal-700 to-teal-800 text-teal-50 w-full border-t border-teal-600/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-3">
                <H3 className="text-white !mt-0">
                  Roger Lee Cormier
                </H3>
                <P className="text-teal-200 !mt-0 text-base">
                  Strategic Technology Leadership | Digital Transformation | Enterprise Integration
                </P>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-teal-300 flex-shrink-0" />
                  <span className="text-teal-100">Wellsville, NY</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-teal-300 flex-shrink-0" />
                  <a 
                    href="mailto:roger@rcormier.dev" 
                    className="text-teal-100 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    roger@rcormier.dev
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <H4 className="text-white !mt-0">Quick Links</H4>
              <div className="space-y-2">
                <a 
                  href="/portfolio" 
                  className="block text-sm text-teal-200 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Portfolio
                </a>
                <a 
                  href="/blog" 
                  className="block text-sm text-teal-200 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Blog
                </a>
                <a 
                  href="/projects" 
                  className="block text-sm text-teal-200 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Projects
                </a>
                <a 
                  href="/contact" 
                  className="block text-sm text-teal-200 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Connect */}
            <div className="space-y-4">
              <H4 className="text-white !mt-0">Connect</H4>
              <div className="space-y-3">
                <a 
                  href="https://linkedin.com/in/rogerleecormier" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-teal-600/50 hover:bg-teal-600 transition-all duration-200 hover:shadow-lg group"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin size={18} className="text-teal-200 group-hover:text-white transition-colors" />
                  <span className="text-sm text-teal-100 group-hover:text-white transition-colors">LinkedIn</span>
                  <ExternalLink className="h-3 w-3 text-teal-400 group-hover:text-teal-200 transition-colors ml-auto" />
                </a>
                
                <a 
                  href="https://github.com/rogerleecormier" 
                  className="flex items-center gap-3 p-3 rounded-lg bg-teal-600/50 hover:bg-teal-600 transition-all duration-200 hover:shadow-lg group"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub size={18} className="text-teal-200 group-hover:text-white transition-colors" />
                  <span className="text-sm text-teal-100 group-hover:text-white transition-colors">GitHub</span>
                  <ExternalLink className="h-3 w-3 text-teal-400 group-hover:text-teal-200 transition-colors ml-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* Professional Statement */}
          <div className="mb-8">
            <div className="max-w-3xl mx-auto text-center">
              <P className="text-teal-200 !mt-0 text-base leading-relaxed">
                Bridging tactical excellence with strategic insight to build better organizations 
                through thoughtful technology leadership and sustainable digital transformation.
              </P>
            </div>
          </div>

          {/* Separator */}
          <Separator className="bg-teal-600/50 mb-6" />

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            {/* Copyright and Tech Stack */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-teal-300">
              <span>© 2025 Roger Lee Cormier Portfolio</span>
              <span className="hidden sm:inline text-teal-500">•</span>
              <span className="flex items-center gap-1">
                Built with <Heart className="h-3 w-3 text-red-400" /> using 
                <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-300 ml-1">
                  React
                </Badge>
                <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-300">
                  TypeScript
                </Badge>
                <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-300">
                  TanStack Router
                </Badge>
              </span>
            </div>
            
            {/* Legal Links */}
            <div className="flex items-center gap-4">
              <a 
                href="/privacy" 
                className="text-teal-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
              >
                Privacy Policy
              </a>
              <a 
                href="/contact" 
                className="text-teal-300 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}