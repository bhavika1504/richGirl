import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1759840278361-f1adc75529a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    title: 'New Indian Collection',
    subtitle: 'Elegant kurtas & traditional sets'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1659522761084-79196b64abe4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    title: 'Western Essentials',
    subtitle: 'Chic tops & contemporary styles'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1708534246051-7f47b279e94b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    title: 'Co-ord Collections',
    subtitle: 'Perfectly paired outfits'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200',
    title: 'Premium Kurtis',
    subtitle: 'Handpicked designs'
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="max-w-[1440px] mx-auto">
        <div className="relative h-[450px] lg:h-[500px]">
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
              <div className="absolute inset-0 flex items-center justify-center lg:justify-start">
                <div className="px-10 lg:px-16 max-w-2xl text-center lg:text-left">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-2 uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
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
                    className="mb-6 px-2 lg:px-0"
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: 'clamp(28px, 5vw, 48px)',
                      lineHeight: '1.1',
                      color: 'white',
                      fontWeight: '600'
                    }}
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <Link to="/shop">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="px-8 py-3 text-white transition-all duration-300 inline-block"
                      style={{
                        backgroundColor: 'var(--brand-cta-green)',
                        borderRadius: '28px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
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
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="transition-all"
                style={{
                  width: currentSlide === index ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentSlide === index ? 'var(--brand-cta-green)' : 'rgba(255, 255, 255, 0.5)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
