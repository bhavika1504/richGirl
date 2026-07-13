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
  discount?: number;
  createdAt?: string;
  ratings?: {
    average: number;
    count: number;
  };
}

function ProductCard({ 
  product, 
  index, 
  badge 
}: { 
  product: Product; 
  index: number; 
  badge?: { text: string; className: string } 
}) {
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

  const netPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="bg-white overflow-hidden relative border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
          style={{ borderRadius: '14px' }}
        >
          {/* Badge */}
          {badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 text-[9px] font-extrabold tracking-widest rounded-full uppercase z-10 shadow-sm ${badge.className}`} style={{ fontFamily: 'var(--font-body)' }}>
              {badge.text}
            </span>
          )}

          {/* Image Container */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <img
              src={product.image || (product.images && product.images[0]) || ''}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Product Info */}
          <div className="p-3 lg:p-4">
            <h3
              className="mb-1 lg:mb-2 truncate"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(12px, 2vw, 13px)',
                color: 'var(--brand-dark-text)',
                fontWeight: '600'
              }}
            >
              {product.name}
            </h3>
            
            {/* Price section with discount support */}
            <div className="flex items-baseline gap-2 mb-2 lg:mb-3">
              <span
                style={{
                  fontFamily: 'var(--font-price)',
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  color: 'var(--brand-cta-green)',
                  fontWeight: '700'
                }}
              >
                ₹{netPrice.toLocaleString()}
              </span>
              {(product.discount || 0) > 0 && (
                <span
                  className="line-through opacity-50 text-gray-500"
                  style={{
                    fontFamily: 'var(--font-price)',
                    fontSize: 'clamp(10px, 1.8vw, 11px)'
                  }}
                >
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Size Pills */}
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes?.slice(0, 3).map((sizeObj: any) => (
                <span
                  key={sizeObj.size || sizeObj}
                  className="px-2 py-0.5 border"
                  style={{
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--brand-dark-text)',
                    borderColor: 'rgba(30, 64, 22, 0.15)',
                    backgroundColor: 'var(--brand-alt-bg)'
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
            transition={{ duration: 0.25 }}
            className="absolute bottom-0 left-0 right-0 text-white py-3 text-center"
            style={{
              backgroundColor: 'var(--brand-cta-green)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: '600',
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

function ProductSection({ 
  title, 
  subtitle,
  products, 
  badgeGetter 
}: { 
  title: string; 
  subtitle: string;
  products: Product[]; 
  badgeGetter: (product: Product) => { text: string; className: string } 
}) {
  if (products.length === 0) return null;
  
  return (
    <section className="py-10 lg:py-14 bg-white border-b border-gray-100 last:border-0">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 mb-6 lg:mb-8 px-1 lg:px-0">
          <div>
            <h2
              className="uppercase tracking-wide text-left mb-1"
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(20px, 4vw, 28px)',
                color: 'var(--brand-dark-text)',
                fontWeight: '700',
                borderBottom: '3px solid var(--brand-cta-green)',
                paddingBottom: '4px',
                display: 'inline-block'
              }}
            >
              {title}
            </h2>
            <p className="text-xs text-gray-400 font-medium" style={{ fontFamily: 'var(--font-body)' }}>
              {subtitle}
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 group text-xs font-bold uppercase tracking-wider text-[var(--brand-dark-text)] hover:text-[var(--brand-cta-green)] transition-colors mt-2 lg:mt-0"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            View All
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index} 
              badge={badgeGetter(product)} 
            />
          ))}
        </div>
      </div>
    </section>
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
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand-cta-green)]"></div>
      </div>
    );
  }

  // Filter lists
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  const bestSellers = [...products]
    .sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0))
    .slice(0, 4);

  const premiumCollection = [...products]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 4);

  const deals = [...products]
    .filter(p => (p.discount || 0) > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 4);
    
  const dealsToShow = deals.length > 0 ? deals : products.slice(0, 4);

  return (
    <div className="bg-white">
      {/* 1. New Arrivals */}
      <ProductSection 
        title="New Arrivals" 
        subtitle="Fresh drops from our designer workshop"
        products={newArrivals} 
        badgeGetter={() => ({ text: 'NEW', className: 'bg-emerald-500 text-white' })}
      />

      {/* 2. Best Sellers */}
      <ProductSection 
        title="Best Sellers" 
        subtitle="The styles everyone is talking about"
        products={bestSellers} 
        badgeGetter={() => ({ text: 'BEST SELLER', className: 'bg-amber-500 text-white' })}
      />

      {/* 3. Premium Collection */}
      <ProductSection 
        title="Premium Collection" 
        subtitle="Luxury ethnic & western statements"
        products={premiumCollection} 
        badgeGetter={() => ({ text: 'PREMIUM', className: 'bg-purple-600 text-white border border-purple-400' })}
      />

      {/* 4. Deals of the Day */}
      <ProductSection 
        title="Deals of the Day" 
        subtitle="Exclusive discounts for a limited time only"
        products={dealsToShow} 
        badgeGetter={(p) => ({ 
          text: p.discount ? `${p.discount}% OFF` : 'DEAL', 
          className: 'bg-red-500 text-white' 
        })}
      />
    </div>
  );
}

