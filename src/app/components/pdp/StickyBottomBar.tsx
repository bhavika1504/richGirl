import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

interface StickyBottomBarProps {
  price: number;
}

export function StickyBottomBar({ price }: StickyBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar when scrolled past 800px
      setIsVisible(window.scrollY > 800);
    };

    handleScroll(); // Check initial scroll position
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden fixed bottom-16 left-0 right-0 bg-white z-40 flex items-center justify-between px-4 py-3"
          style={{ borderTop: '0.5px solid var(--brand-border)', height: '64px' }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}>
              Price
            </p>
            <p
              style={{
                fontFamily: 'var(--font-price)',
                fontSize: '18px',
                fontWeight: '500',
                color: 'var(--brand-dark-text)'
              }}
            >
              ₹{price.toLocaleString()}
            </p>
          </div>

          <Link
            to="/cart"
            className="rounded-full px-7 py-3 text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--brand-cta-green)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            ADD TO CART
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
