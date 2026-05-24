import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
}

export function FilterBottomSheet({ isOpen, onClose, onClearAll }: FilterBottomSheetProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('category');

  const categories = [
    { name: '3-Piece Suit', count: 12 },
    { name: 'Kurtis', count: 8, selected: true },
    { name: 'Short Kurta', count: 6 },
    { name: '2-Piece Kurti Set', count: 5 },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const [selectedSizes, setSelectedSizes] = useState(['M']);

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
                    {categories.map((cat) => (
                      <label key={cat.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            defaultChecked={cat.selected}
                            className="w-4 h-4 rounded accent-[var(--brand-cta-green)]"
                          />
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              color: 'var(--brand-dark-text)'
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
                        onClick={() => {
                          setSelectedSizes(prev =>
                            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                          );
                        }}
                        className="px-4 py-2 rounded-md"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          backgroundColor: selectedSizes.includes(size) ? 'var(--brand-cta-green)' : 'var(--brand-white)',
                          color: selectedSizes.includes(size) ? 'var(--brand-white)' : 'var(--brand-dark-text)',
                          border: selectedSizes.includes(size) ? 'none' : '0.5px solid var(--brand-border)'
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
                      </button>
                    ))}
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
