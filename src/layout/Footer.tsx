import { MapPin, Mail } from 'lucide-react'
import { FaLinkedin, FaGithub } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-teal-700 text-teal-50 w-full">
      <div className="w-full px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Name and Title */}
          <div>
            <h3 className="text-xl font-bold text-white">Roger Lee Cormier</h3>
            <p className="text-teal-200 text-sm mt-1">
              Strategic Technology Leadership | Digital Transformation | Enterprise Integration
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-teal-300" />
              <span>Wellsville, NY</span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-teal-300" />
              <a 
                href="mailto:roger@rcormier.dev" 
                className="hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                roger@rcormier.dev
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            <a 
              href="https://linkedin.com/in/rogerleecormier" 
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 transition-colors"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin size={20} />
            </a>
            <a 
              href="https://github.com/rogerleecormier" 
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 transition-colors"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={20} />
            </a>
            <a 
              href="/contact" 
              className="p-2 rounded-lg bg-teal-600 hover:bg-teal-500 transition-colors"
              aria-label="Contact"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Professional Statement */}
          <div className="max-w-2xl mx-auto">
            <p className="text-teal-200 text-sm leading-relaxed">
              Bridging tactical excellence with strategic insight to build better organizations 
              through thoughtful technology leadership and sustainable digital transformation.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-teal-600 pt-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs text-teal-300">
              {/* Fixed: Use static year to prevent hydration mismatch */}
              <span>© 2025 Roger Lee Cormier Portfolio</span>
              <span className="hidden sm:inline">•</span>
              <span>Built with ❤️ using React, TypeScript & TanStack Router</span>
            </div>
            
            {/* Legal Links */}
            <div className="flex justify-center mt-2">
              <a 
                href="/privacy" 
                className="text-xs text-teal-300 hover:text-white transition-colors underline"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}