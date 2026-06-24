import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

const slides = [
  {
    id: 1,
    image: '/assets/slider/indian.png',
    title: 'Timeless Indian Elegance',
    subtitle: 'Handcrafted ethnic wear for every occasion',
    link: '/shop/indian'
  },
  {
    id: 2,
    image: '/assets/slider/western.png',
    title: 'Modern Western Chic',
    subtitle: 'Sophisticated styles for the modern woman',
    link: '/shop/western'
  },
  {
    id: 3,
    image: '/assets/slider/cord_set.png',
    title: 'Luxury Co-ord Sets',
    subtitle: 'Effortless elegance in perfectly paired silhouettes',
    link: '/shop/western%20cord%20set'
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-black">
      {/* Full-width container for slider images */}
      <div
        className="relative h-[260px] lg:h-[500px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-end lg:items-center pb-8 lg:pb-0">
              <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 text-left">
                <div className="max-w-2xl">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-0.5 lg:mb-2 uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      color: 'var(--brand-cta-green)',
                      fontWeight: '600'
                    }}
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3 lg:mb-6"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 'clamp(22px, 5vw, 48px)',
                      lineHeight: '1.2',
                      color: 'white',
                      fontWeight: '600'
                    }}
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <Link to={slides[currentSlide].link || '/shop'}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="px-6 lg:px-8 py-2 lg:py-3 text-white transition-all duration-300 inline-block"
                      style={{
                        backgroundColor: 'var(--brand-cta-green)',
                        borderRadius: '28px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      SHOP NOW
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows — hidden on mobile */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all z-10 hidden lg:block"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all z-10 hidden lg:block"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="transition-all"
              style={{
                width: currentSlide === index ? '24px' : '6px',
                height: '6px',
                borderRadius: '4px',
                backgroundColor: currentSlide === index ? 'var(--brand-cta-green)' : 'rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
