/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Precision Strategy Design System
        'strategy-gold': '#FFD700',
        'strategy-gold-dark': '#FFA500',
        'strategy-emerald': '#66CC99',
        'strategy-rose': '#E85D5D',
        'precision-charcoal': '#121729',
        'precision-charcoal-light': '#2B2F46',
        
        // Surface Colors
        'surface-base': '#0F172A',
        'surface-elevated': '#1E2847',
        'surface-deep': '#0B0F1F',
        
        // Text Colors
        'text-foreground': '#FAFBFC',
        'text-secondary': '#B3B9C7',
        'text-tertiary': '#7F8699',
        'text-muted-foreground': '#B3B9C7',
        'text-muted': '#7F8699',
        
        // Border Colors
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        
        // Legacy color system - Professional Hunter Green, Slate, Gold
        hunter: {
          50: '#f0faf7',
          100: '#d4f1eb',
          200: '#a8e3d7',
          300: '#7dd5c3',
          400: '#52c7af',
          500: '#2a9d82',
          600: '#268a6f',
          700: '#1e6b58',
          800: '#0d3a3a',
          900: '#092a27',
          950: '#051a18',
        },
        gold: {
          50: '#fef9e8',
          100: '#fef3cc',
          200: '#fde799',
          300: '#fcd966',
          400: '#fbcd33',
          500: '#f4c430',
          600: '#d4a328',
          700: '#b8860b',
          800: '#8b6914',
          900: '#6b5410',
          950: '#3d2f08',
        },
        grey: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace',
        ],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px rgba(13, 58, 58, 0.1)',
        glass: '0 8px 16px rgba(13, 58, 58, 0.12)',
        'glass-lg': '0 20px 25px rgba(13, 58, 58, 0.15)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
