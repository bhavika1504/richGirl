import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../services/api';

interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  sizes: any[];
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="bg-white overflow-hidden relative"
          style={{ borderRadius: '14px' }}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <img
              src={product.image || (product.images && product.images[0]) || ''}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Product Info */}
          <div className="p-2.5 lg:p-4">
            <h3
              className="mb-1 lg:mb-2 truncate"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(12px, 2vw, 13px)',
                color: 'var(--brand-dark-text)'
              }}
            >
              {product.name}
            </h3>
            <p
              className="mb-2 lg:mb-3"
              style={{
                fontFamily: 'var(--font-price)',
                fontSize: 'clamp(13px, 2vw, 14px)',
                color: 'var(--brand-cta-green)',
                fontWeight: '500'
              }}
            >
              ₹{product.price.toLocaleString()}
            </p>

            {/* Size Pills */}
            <div className="flex gap-2 flex-wrap">
              {product.sizes?.slice(0, 3).map((sizeObj: any) => (
                <span
                  key={sizeObj.size || sizeObj}
                  className="px-3 py-1 border"
                  style={{
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--brand-dark-text)',
                    borderColor: 'rgba(30, 64, 22, 0.2)'
                  }}
                >
                  {sizeObj.size || sizeObj}
                </span>
              ))}
            </div>
          </div>

          {/* Add to Cart Bar - Slides up on hover */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 text-white py-3 text-center"
            style={{
              backgroundColor: 'var(--brand-cta-green)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: '500',
              borderRadius: '0 0 14px 14px'
            }}
          >
            Add to Cart
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 8)); // Just show 8 on home
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 lg:mb-10 text-center lg:text-left">
          <h2
            className="uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(24px, 3vw, 36px)',
              color: 'var(--brand-dark-text)',
              fontWeight: '700',
              borderBottom: '3px solid var(--brand-cta-green)',
              paddingBottom: '8px'
            }}
          >
            Latest Collection
          </h2>
          <Link
            to="/shop"
            className="flex items-center gap-2 group"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--brand-dark-text)'
            }}
          >
            View All
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
