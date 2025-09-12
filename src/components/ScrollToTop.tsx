import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className='fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-r from-teal-800 to-blue-800 hover:from-teal-900 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0'
      size='icon'
      aria-label='Scroll to top'
    >
      <ArrowUp className='h-5 w-5' />
    </Button>
  );
}

export default ScrollToTop;
