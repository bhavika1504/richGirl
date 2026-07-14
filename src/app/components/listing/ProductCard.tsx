import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router';

interface Product {
  id: number;
  name: string;
  image: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  fabric: string;
  sizes: any[];
  badge?: string;
  isNew?: boolean;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
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
    <Link to={`/product/${product.id}`}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-pointer bg-white"
        style={{
          borderRadius: '14px',
          border: `0.5px solid ${isHovered ? 'var(--brand-cta-green)' : 'var(--brand-mist-green)'}`,
          transition: 'border-color 0.2s',
          height: '100%'
        }}
      >
        {/* Image Area */}
        <div className="relative overflow-hidden" style={{ borderRadius: '14px 14px 0 0', aspectRatio: '3/4' }}>
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: 'var(--brand-alt-bg)' }}
          />

          {/* Badge */}
          {product.badge && (
            <div
              className="absolute top-2 left-2 px-3 py-1 rounded-full"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                backgroundColor: product.isNew ? 'var(--brand-cta-green)' : 'var(--brand-dark-text)',
                color: product.isNew ? 'var(--brand-white)' : 'var(--brand-mist-green)'
              }}
            >
              {product.badge}
            </div>
          )}

          {/* Wishlist Icon */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full"
          >
            <Heart
              className="w-4 h-4"
              style={{
                color: 'var(--brand-dark-text)',
                fill: isWishlisted ? 'var(--brand-cta-green)' : 'none'
              }}
            />
          </motion.button>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div
                className="px-4 py-1 rounded-full"
                style={{
                  backgroundColor: '#F0F0F0',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: '#888'
                }}
              >
                Out of Stock
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-2.5 lg:p-4">
          <h3
            className="mb-0.5 lg:mb-1 truncate"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(13px, 2.2vw, 15px)',
              fontWeight: '500',
              color: 'var(--brand-dark-text)'
            }}
          >
            {product.name}
          </h3>

          <p
            className="mb-1.5 lg:mb-2 hidden lg:block"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(11px, 1.5vw, 12px)',
              color: 'var(--brand-secondary-text)'
            }}
          >
            {product.fabric}
          </p>

          {/* Price */}
          <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
            <span
              style={{
                fontFamily: 'var(--font-price)',
                fontSize: 'clamp(14px, 2.2vw, 16px)',
                fontWeight: '500',
                color: 'var(--brand-dark-text)'
              }}
            >
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span
                className="line-through"
                style={{
                  fontFamily: 'var(--font-price)',
                  fontSize: 'clamp(11px, 1.5vw, 13px)',
                  color: '#888'
                }}
              >
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Sizes */}
          <div className="flex gap-1 flex-wrap">
            {product.sizes && product.sizes.slice(0, 3).map((sizeObj, idx) => {
              const sizeStr = typeof sizeObj === 'object' && sizeObj !== null ? (sizeObj.size || sizeObj.name) : sizeObj;
              const sizeKey = typeof sizeObj === 'object' && sizeObj !== null ? (sizeObj._id || sizeObj.size || idx) : sizeObj;
              return (
                <span
                  key={sizeKey}
                  className="px-2 py-0.5 rounded border"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(10px, 1.5vw, 11px)',
                    color: 'var(--brand-dark-text)',
                    borderColor: 'var(--brand-border)'
                  }}
                >
                  {sizeStr}
                </span>
              );
            })}
          </div>
        </div>

        {/* Add to Cart Bar - Desktop Hover */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isHovered && product.inStock ? 0 : '100%' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-center text-white hidden lg:flex"
          style={{
            backgroundColor: 'var(--brand-cta-green)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.08em',
            borderRadius: '0 0 14px 14px'
          }}
        >
          Add to Cart
        </motion.div>
      </motion.div>
    </Link>
  );
}
