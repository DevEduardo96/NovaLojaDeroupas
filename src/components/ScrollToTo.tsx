// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'wouter';

const ScrollToTop = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // use 'auto' se não quiser animação
    });
  }, [location]);

  return null;
};

export default ScrollToTop;
