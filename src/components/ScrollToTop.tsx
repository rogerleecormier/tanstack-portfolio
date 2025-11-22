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
      className='fixed bottom-6 right-6 z-50 size-12 rounded-full border-0 bg-gradient-to-r from-hunter-700 to-hunter-900 text-white shadow-lg transition-all duration-200 hover:from-hunter-800 hover:to-black hover:shadow-xl'
      size='icon'
      aria-label='Scroll to top'
    >
      <ArrowUp className='size-5' />
    </Button>
  );
}

export default ScrollToTop;
