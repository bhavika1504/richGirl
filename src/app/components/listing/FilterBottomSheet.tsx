import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  activeSizes: string[];
  activeColors: string[];
  activeSubCategories: string[];
  priceRange: [number, number];
  onClearAll: () => void;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onToggleSubCategory: (subCat: string) => void;
  onPriceChange: (range: [number, number]) => void;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  category,
  activeSizes,
  activeColors,
  activeSubCategories,
  priceRange,
  onClearAll,
  onToggleSize,
  onToggleColor,
  onToggleSubCategory,
  onPriceChange
}: FilterBottomSheetProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('category');

  const indianSubCategories = [
    { name: 'Saree', count: 12 },
    { name: 'Kurta', count: 8 },
    { name: 'Salwar Kameez', count: 6 },
    { name: 'Lehengas', count: 5 },
    { name: 'Palazzos', count: 4 },
  ];

  const westernSubCategories = [
    { name: 'Dresses', count: 15 },
    { name: 'Tops', count: 10 },
    { name: 'Skirts', count: 8 },
    { name: 'Jeans', count: 7 },
  ];

  const currentSubCategories = category === 'western' ? westernSubCategories : indianSubCategories;
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Pink', hex: '#FFB6C1' },
    { name: 'Yellow', hex: '#FFD700' },
    { name: 'Green', hex: '#5BBF4E' },
    { name: 'Beige', hex: '#F5F5DC' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white z-50 lg:hidden overflow-y-auto"
            style={{
              borderRadius: '20px 20px 0 0',
              maxHeight: '90vh'
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--brand-border)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--brand-dark-text)'
                }}
              >
                Filters
              </h3>
              <button
                onClick={onClearAll}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--brand-cta-green)'
                }}
              >
                Clear All
              </button>
            </div>

            {/* Filter Groups */}
            <div className="px-5 pb-6 space-y-4">
              {/* Category */}
              <div>
                <button
                  onClick={() => setExpandedGroup(expandedGroup === 'category' ? null : 'category')}
                  className="flex items-center justify-between w-full py-3"
                  style={{ borderBottom: '0.5px solid var(--brand-border)' }}
                >
                  <span
                    className="uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--brand-secondary-text)'
                    }}
                  >
                    Category
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedGroup === 'category' ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--brand-dark-text)' }}
                  />
                </button>
                {expandedGroup === 'category' && (
                  <div className="pt-3 space-y-2">
                    {currentSubCategories.map((cat) => (
                      <label key={cat.name} className="flex items-center justify-between py-2 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={activeSubCategories.includes(cat.name)}
                            onChange={() => onToggleSubCategory(cat.name)}
                            className="w-4 h-4 rounded accent-[var(--brand-cta-green)]"
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              color: activeSubCategories.includes(cat.name) ? 'var(--brand-cta-green)' : 'var(--brand-dark-text)',
                              fontWeight: activeSubCategories.includes(cat.name) ? '600' : '400'
                            }}
                          >
                            {cat.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            color: 'var(--brand-secondary-text)'
                          }}
                        >
                          ({cat.count})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Size */}
              <div>
                <button
                  onClick={() => setExpandedGroup(expandedGroup === 'size' ? null : 'size')}
                  className="flex items-center justify-between w-full py-3"
                  style={{ borderBottom: '0.5px solid var(--brand-border)' }}
                >
                  <span
                    className="uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--brand-secondary-text)'
                    }}
                  >
                    Size
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedGroup === 'size' ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--brand-dark-text)' }}
                  />
                </button>
                {expandedGroup === 'size' && (
                  <div className="pt-3 flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => onToggleSize(size)}
                        className="px-4 py-2 rounded-md transition-all"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          backgroundColor: activeSizes.includes(size) ? 'var(--brand-cta-green)' : 'var(--brand-white)',
                          color: activeSizes.includes(size) ? 'var(--brand-white)' : 'var(--brand-dark-text)',
                          border: activeSizes.includes(size) ? 'none' : '0.5px solid var(--brand-border)'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color */}
              <div>
                <button
                  onClick={() => setExpandedGroup(expandedGroup === 'color' ? null : 'color')}
                  className="flex items-center justify-between w-full py-3"
                  style={{ borderBottom: '0.5px solid var(--brand-border)' }}
                >
                  <span
                    className="uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--brand-secondary-text)'
                    }}
                  >
                    Color
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedGroup === 'color' ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--brand-dark-text)' }}
                  />
                </button>
                {expandedGroup === 'color' && (
                  <div className="pt-3 flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => onToggleColor(color.name)}
                        className="relative"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            backgroundColor: color.hex,
                            border: color.hex === '#FFFFFF' ? '0.5px solid var(--brand-border)' : 'none'
                          }}
                        />
                        {activeColors.includes(color.name) && (
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              border: '2px solid var(--brand-cta-green)',
                              margin: '-4px'
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <button
                  onClick={() => setExpandedGroup(expandedGroup === 'price' ? null : 'price')}
                  className="flex items-center justify-between w-full py-3"
                  style={{ borderBottom: '0.5px solid var(--brand-border)' }}
                >
                  <span
                    className="uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--brand-secondary-text)'
                    }}
                  >
                    Price Range
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedGroup === 'price' ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--brand-dark-text)' }}
                  />
                </button>
                {expandedGroup === 'price' && (
                  <div className="pt-3 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Min (₹)</label>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Max (₹)</label>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value) || 0])}
                          className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-center text-xs font-bold text-[var(--brand-cta-green)]">
                      ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white p-5 border-t" style={{ borderColor: 'var(--brand-border)' }}>
              <button
                onClick={onClose}
                className="w-full h-12 rounded-full text-white"
                style={{
                  backgroundColor: 'var(--brand-cta-green)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
