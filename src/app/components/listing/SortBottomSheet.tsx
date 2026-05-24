import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface SortBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  'Newest First',
  'Price: Low to High',
  'Price: High to Low',
  'Most Popular',
  'Top Rated'
];

export function SortBottomSheet({ isOpen, onClose, sortBy, onSortChange }: SortBottomSheetProps) {
  const handleSelect = (option: string) => {
    onSortChange(option);
    setTimeout(onClose, 200);
  };

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
            className="fixed bottom-0 left-0 right-0 bg-white z-50 lg:hidden"
            style={{ borderRadius: '20px 20px 0 0' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-4">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--brand-border)' }} />
            </div>

            {/* Header */}
            <div className="px-5 pb-3">
              <h3
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--brand-dark-text)'
                }}
              >
                Sort By
              </h3>
            </div>

            {/* Sort Options */}
            <div>
              {sortOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="w-full flex items-center justify-between px-5 py-4"
                  style={{
                    borderBottom: index < sortOptions.length - 1 ? '0.5px solid var(--brand-alt-bg)' : 'none'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      color: sortBy === option ? 'var(--brand-cta-green)' : 'var(--brand-dark-text)',
                      fontWeight: sortBy === option ? '500' : '400'
                    }}
                  >
                    {option}
                  </span>
                  {sortBy === option && (
                    <Check className="w-5 h-5" style={{ color: 'var(--brand-cta-green)' }} />
                  )}
                </button>
              ))}
            </div>

            <div className="h-6" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
