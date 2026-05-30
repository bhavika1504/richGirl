import { Heart, Truck, Calendar, RefreshCw, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useState } from 'react';

interface Product {
  id: string;
  _id?: string;
  category: string;
  name: string;
  rating: number;
  ratingCount?: number;
  reviewCount: number;
  price: number;
  originalPrice: number;
  discount: number;
  fabric: string;
  length: string;
  occasion: string;
  colors: string[]; // Flat list of colors for display
  sizes: {
    size: string;
    variants: { color: string; stock: number }[]
  }[];
  images: string[];
}

interface ProductInfoProps {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
  onQuantityChange: (qty: number) => void;
}

import { useNavigate } from 'react-router';
import { api } from '../../services/api';

export function ProductInfo({
  product,
  selectedColor,
  selectedSize,
  quantity,
  onColorChange,
  onSizeChange,
  onQuantityChange
}: ProductInfoProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    setIsAdding(true);
    try {
      await api.addToCart({
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        price: product.price,
        originalPrice: product.originalPrice
      });
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };
  return (
    <div>
      {/* Category */}
      <Link
        to="/shop"
        className="uppercase tracking-wider"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--brand-cta-green)',
          letterSpacing: '0.1em'
        }}
      >
        {product.category}
      </Link>

      {/* Product Name */}
      <h1
        className="mt-2 mb-3"
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(26px, 4vw, 36px)',
          lineHeight: '1.2',
          color: 'var(--brand-dark-text)'
        }}
      >
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: '16px',
                color: i < Math.floor(product.rating) ? 'var(--brand-cta-green)' : 'var(--brand-border)'
              }}
            >
              ★
            </span>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '500', color: 'var(--brand-dark-text)' }}>
          {product.rating}
        </span>
        <a
          href="#reviews"
          className="hover:underline"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}
        >
          ({product.reviewCount} reviews)
        </a>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3 mb-5">
        <span
          style={{
            fontFamily: 'var(--font-price)',
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: '500',
            color: 'var(--brand-dark-text)'
          }}
        >
          ₹{(product.price || 0).toLocaleString()}
        </span>
        <span
          className="line-through"
          style={{
            fontFamily: 'var(--font-price)',
            fontSize: '15px',
            color: '#888'
          }}
        >
          ₹{(product.originalPrice || product.price || 0).toLocaleString()}
        </span>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--brand-mist-green)',
            color: '#3D9E32',
            fontFamily: 'var(--font-body)',
            fontSize: '11px'
          }}
        >
          {product.discount}% off
        </span>
      </div>

      {/* Divider */}
      <div className="my-5" style={{ borderBottom: '0.5px solid var(--brand-border)' }} />

      {/* Product Meta */}
      <div className="space-y-1.5 mb-5">
        <div className="flex py-1.5" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          <span className="w-24" style={{ color: 'var(--brand-secondary-text)' }}>Fabric</span>
          <span style={{ color: 'var(--brand-dark-text)' }}>{product.fabric}</span>
        </div>
        <div className="flex py-1.5" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          <span className="w-24" style={{ color: 'var(--brand-secondary-text)' }}>Length</span>
          <span style={{ color: 'var(--brand-dark-text)' }}>{product.length}</span>
        </div>
        <div className="flex py-1.5" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          <span className="w-24" style={{ color: 'var(--brand-secondary-text)' }}>Occasion</span>
          <span style={{ color: 'var(--brand-dark-text)' }}>{product.occasion}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5" style={{ borderBottom: '0.5px solid var(--brand-border)' }} />

      {/* Color Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}>
            Color
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-dark-text)' }}>
            {selectedColor}
          </span>
        </div>
        <div className="flex gap-2.5">
          {product.colors.map((colorName) => {
            // Check if this color is available in the selected size
            const isAvailableForSelectedSize = selectedSize
              ? product.sizes.find(s => s.size === selectedSize)?.variants.some(v => v.color === colorName && v.stock > 0)
              : true;

            return (
              <motion.button
                key={colorName}
                onClick={() => onColorChange(colorName)}
                className="relative disabled:opacity-30"
                whileHover={isAvailableForSelectedSize ? { scale: 1.1 } : {}}
                whileTap={isAvailableForSelectedSize ? { scale: 0.95 } : {}}
              >
                <div
                  className="w-7 h-7 rounded-full border border-gray-200"
                  style={{
                    backgroundColor: colorName.toLowerCase(), // Minimal hex mapping or just name
                  }}
                />
                {selectedColor === colorName && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2.5px solid var(--brand-cta-green)',
                      margin: '-4px'
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}>
            Size
          </span>
          <div
            className="flex items-center gap-1"
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-cta-green)', cursor: 'pointer' }}
          >
            Size Guide ↗
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {product.sizes && product.sizes.map((szObj, idx) => {
            const sizeName = szObj.size;
            const totalStockForSize = szObj.variants.reduce((acc, v) => acc + v.stock, 0);
            const isAvailable = totalStockForSize > 0;

            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => isAvailable && onSizeChange(sizeName)}
                disabled={!isAvailable}
                className="relative"
                style={{
                  width: '44px',
                  height: '36px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  backgroundColor: selectedSize === sizeName ? 'var(--brand-dark-text)' : 'transparent',
                  color: !isAvailable ? 'var(--brand-border)' : selectedSize === sizeName ? 'white' : 'var(--brand-dark-text)',
                  border: selectedSize === sizeName ? 'none' : '0.5px solid var(--brand-border)',
                  cursor: isAvailable ? 'pointer' : 'not-allowed'
                }}
                whileHover={isAvailable ? { backgroundColor: 'var(--brand-mist-green)' } : {}}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
              >
                {sizeName}
                {!isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-full h-px"
                      style={{
                        backgroundColor: 'var(--brand-border)',
                        transform: 'rotate(-45deg)'
                      }}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quantity + CTA */}
      <div className="space-y-3 mb-5">
        {/* Quantity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-[var(--brand-alt-bg)]"
            style={{
              borderColor: 'var(--brand-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--brand-dark-text)'
            }}
          >
            −
          </button>
          <div
            className="w-9 h-9 flex items-center justify-center rounded-lg border"
            style={{
              borderColor: 'var(--brand-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--brand-dark-text)'
            }}
          >
            {quantity}
          </div>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-[var(--brand-alt-bg)]"
            style={{
              borderColor: 'var(--brand-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--brand-dark-text)'
            }}
          >
            +
          </button>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 h-12 lg:h-[50px] rounded-full text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--brand-cta-green)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              letterSpacing: '0.1em',
              fontWeight: '500',
              cursor: isAdding ? 'wait' : 'pointer',
              opacity: isAdding ? 0.7 : 1
            }}
            whileHover={{ backgroundColor: '#3D9E32', scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
          >
            {isAdding ? 'ADDING...' : 'ADD TO CART'}
          </motion.button>
          <motion.button
            className="flex-1 h-12 lg:h-[50px] rounded-full bg-white flex items-center justify-center gap-2"
            style={{
              border: '1.5px solid var(--brand-cta-green)',
              color: '#3D9E32',
              fontFamily: 'var(--font-body)',
              fontSize: '13px'
            }}
            whileHover={{ backgroundColor: 'var(--brand-mist-green)' }}
            whileTap={{ scale: 0.96 }}
          >
            WISHLIST <Heart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Delivery Info */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ backgroundColor: 'var(--brand-alt-bg)' }}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
            <Truck className="w-4 h-4" style={{ color: 'var(--brand-cta-green)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-dark-text)' }}>
              Free delivery on orders above ₹999
            </span>
          </div>
          <div className="flex items-center gap-3 py-2" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
            <Calendar className="w-4 h-4" style={{ color: 'var(--brand-cta-green)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-dark-text)' }}>
              Estimated delivery: 3–5 business days
            </span>
          </div>
          <div className="flex items-center gap-3 py-2">
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--brand-cta-green)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-dark-text)' }}>
              Easy 7-day returns
            </span>
          </div>
        </div>
      </div>

      {/* Share */}
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}>
          Share:
        </span>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.1, color: 'var(--brand-cta-green)' }} className="transition-colors">
            <Share2 className="w-[18px] h-[18px]" style={{ color: 'var(--brand-dark-text)' }} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
