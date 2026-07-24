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
        className="relative group cursor-pointer bg-white flex flex-col"
        style={{
          borderRadius: '14px',
          border: `1px solid ${isHovered ? 'var(--brand-cta-green)' : 'var(--brand-border)'}`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isHovered ? '0 4px 20px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        {/* Image Area — takes up most of the card */}
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ borderRadius: '13px 13px 0 0', aspectRatio: '3/4' }}
        >
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
            style={{ backgroundColor: 'var(--brand-alt-bg)' }}
          />

          {/* Badge */}
          {product.badge && (
            <div
              className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: '700',
                backgroundColor: product.isNew ? 'var(--brand-cta-green)' : 'var(--brand-dark-text)',
                color: 'white'
              }}
            >
              {product.badge}
            </div>
          )}

          {/* Wishlist Icon */}
          <button
            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full transition-opacity"
            style={{ opacity: isHovered ? 1 : 0 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
          >
            <Heart
              className="w-3.5 h-3.5"
              style={{
                color: 'var(--brand-dark-text)',
                fill: isWishlisted ? 'var(--brand-cta-green)' : 'none'
              }}
            />
          </button>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <div
                className="px-3 py-0.5 rounded-full"
                style={{
                  backgroundColor: '#F0F0F0',
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: '#888'
                }}
              >
                Out of Stock
              </div>
            </div>
          )}

          {/* Add to Cart bar — slides up over BOTTOM of image only */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: isHovered && product.inStock ? 0 : '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 h-9 items-center justify-center text-white hidden lg:flex"
            style={{
              backgroundColor: 'var(--brand-cta-green)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.08em'
            }}
          >
            Add to Cart
          </motion.div>
        </div>

        {/* Card Body — compact info below image */}
        <div className="px-2.5 py-2 lg:px-3 lg:py-2.5">
          <h3
            className="truncate mb-0.5"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: '700',
              color: 'var(--brand-dark-text)'
            }}
          >
            {product.name}
          </h3>

          {/* Fabric — desktop only */}
          <p
            className="mb-1 hidden lg:block truncate"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--brand-secondary-text)'
            }}
          >
            {product.fabric}
          </p>

          {/* Price */}
          <div className="flex items-center gap-1.5">
            <span
              style={{
                fontFamily: 'var(--font-price)',
                fontSize: 'clamp(13px, 2vw, 15px)',
                fontWeight: '700',
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
                  fontSize: 'clamp(10px, 1.5vw, 12px)',
                  color: '#aaa'
                }}
              >
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
