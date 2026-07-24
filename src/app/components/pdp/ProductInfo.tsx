import { Heart, Truck, Calendar, RefreshCw, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useState } from 'react';

interface Product {
  id: string;
  _id?: string;
  category: string;
  categoryName?: string;
  name: string;
  ratings?: {
    average: number;
    count: number;
  };
  reviewCount?: number;
  price: number;
  originalPrice: number;
  discount: number;
  fabric: string;
  length: string;
  occasion: string;
  colors: string[]; // Flat list of colors for display
  sizes: {
    size: string;
    variants: { color: string; colorLabel?: string; stock: number }[]
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    setIsAdding(true);
    try {
      await api.addToCart({
        productId: product.id || product._id,
        name: product.name,
        image: product.images?.[0] || '',
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
        price: product.price,
        originalPrice: product.originalPrice
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    setIsBuying(true);
    try {
      await api.addToCart({
        productId: product.id || product._id,
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
      console.error('Failed to process Buy Now:', error);
      alert('Failed to process Buy Now');
    } finally {
      setIsBuying(false);
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
        {product.categoryName || product.category}
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
                color: i < Math.floor(product.ratings?.average || 0) ? 'var(--brand-cta-green)' : 'var(--brand-border)'
              }}
            >
              ★
            </span>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '500', color: 'var(--brand-dark-text)' }}>
          {product.ratings?.average || 0}
        </span>
        <a
          href="#reviews"
          className="hover:underline"
          style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}
        >
          ({product.ratings?.count || 0} reviews)
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
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}>
              Color
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-dark-text)', fontWeight: '600' }}>
              {selectedColor || 'Please select'}
            </span>
          </div>
          <div className="flex gap-2.5">
            {(() => {
              const currentSizeObj = product.sizes.find(s => s.size === selectedSize);
              const availableColorsForSize = Array.from(new Set(
                currentSizeObj?.variants.map(v => v.colorLabel || v.color) || []
              )).filter(Boolean);

              return availableColorsForSize.map((colorNameOrLabel: any) => {
                // Find the base color for this label in the selected size variants
                const variant = currentSizeObj?.variants.find(v => (v.colorLabel || v.color) === colorNameOrLabel);
                const baseColor = variant?.color || colorNameOrLabel;
                const isAvailable = variant ? variant.stock > 0 : false;

                return (
                  <motion.button
                    key={colorNameOrLabel}
                    onClick={() => isAvailable && onColorChange(colorNameOrLabel)}
                    disabled={!isAvailable}
                    className="relative p-1 rounded-full border-2 transition-all"
                    style={{
                      borderColor: selectedColor === colorNameOrLabel ? 'var(--brand-cta-green)' : 'transparent',
                      opacity: isAvailable ? 1 : 0.3,
                      cursor: isAvailable ? 'pointer' : 'not-allowed'
                    }}
                    whileHover={isAvailable ? { scale: 1.1 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    title={colorNameOrLabel}
                  >
                    <div
                      className="w-7 h-7 rounded-full border border-gray-100"
                      style={{
                        backgroundColor: baseColor.toLowerCase(),
                        backgroundImage: baseColor.toLowerCase() === 'multi' ? 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' : 'none'
                      }}
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-red-400 rotate-45 opacity-60" />
                      </div>
                    )}
                  </motion.button>
                );
              });
            })()}
          </div>
        </div>
      )}

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
            const isSelected = selectedSize === sizeName;

            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => isAvailable && onSizeChange(sizeName)}
                disabled={!isAvailable}
                className="relative group"
                style={{
                  width: '48px',
                  height: '40px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '400',
                  backgroundColor: isSelected ? 'var(--brand-dark-text)' : 'transparent',
                  color: !isAvailable ? 'var(--brand-border)' : isSelected ? 'white' : 'var(--brand-dark-text)',
                  border: isSelected ? 'none' : '1px solid var(--brand-border)',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
                whileHover={isAvailable ? { y: -2, borderColor: 'var(--brand-cta-green)' } : {}}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
              >
                {sizeName}
                {isSelected && (
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--brand-cta-green)] rounded-full border-2 border-white"
                  />
                )}
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

        <div className="space-y-2.5 w-full">
          {/* BUY NOW Button (Primary Direct Action) */}
          <motion.button
            onClick={handleBuyNow}
            disabled={isBuying}
            className="w-full h-13 rounded-2xl text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--brand-dark-text)',
              fontFamily: 'var(--font-body)',
              opacity: isBuying ? 0.7 : 1
            }}
            whileHover={{ scale: 1.01, backgroundColor: '#0d1e0a' }}
            whileTap={{ scale: 0.98 }}
          >
            {isBuying ? 'PROCESSING...' : '⚡ BUY NOW'}
          </motion.button>

          {/* ADD TO CART & WISHLIST Row */}
          <div className="flex gap-2.5 w-full">
            <motion.button
              onClick={handleAddToCart}
              disabled={isAdding || showSuccess}
              className="flex-1 h-12 rounded-2xl text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              style={{
                backgroundColor: showSuccess ? '#3D9E32' : 'var(--brand-cta-green)',
                fontFamily: 'var(--font-body)',
                opacity: isAdding ? 0.7 : 1
              }}
              whileHover={!(isAdding || showSuccess) ? { backgroundColor: '#3D9E32', scale: 1.01 } : {}}
              whileTap={!(isAdding || showSuccess) ? { scale: 0.98 } : {}}
            >
              {isAdding ? 'ADDING...' : showSuccess ? (
                <>
                  ADDED! <RefreshCw className="w-4 h-4 animate-spin-slow" />
                </>
              ) : 'ADD TO CART'}
            </motion.button>

            <motion.button
              className="px-5 h-12 rounded-2xl bg-white border-2 border-[var(--brand-cta-green)] text-[var(--brand-cta-green)] font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                fontFamily: 'var(--font-body)'
              }}
              whileHover={{ backgroundColor: 'var(--brand-mist-green)', scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">WISHLIST</span>
            </motion.button>
          </div>
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
