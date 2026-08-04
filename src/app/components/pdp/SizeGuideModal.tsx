import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeGuide?: {
    headers: string[];
    rows: string[][];
  };
}

const DEFAULT_HEADERS = ['Size', 'Chest', 'Waist', 'Hip', 'Length'];
const DEFAULT_ROWS = [
  ['XS', '32"', '26"', '34"', '45"'],
  ['S',  '34"', '28"', '36"', '46"'],
  ['M',  '36"', '30"', '38"', '47"'],
  ['L',  '38"', '32"', '40"', '48"'],
  ['XL', '40"', '34"', '42"', '49"'],
  ['2XL','42"', '36"', '44"', '50"'],
  ['3XL','44"', '38"', '46"', '51"'],
  ['4XL','46"', '40"', '48"', '52"'],
];

export function SizeGuideModal({ isOpen, onClose, sizeGuide }: SizeGuideModalProps) {
  const headers = sizeGuide?.headers || DEFAULT_HEADERS;
  const rows = sizeGuide?.rows || DEFAULT_ROWS;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="relative z-10 bg-white w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2
                  className="text-xl font-bold text-[#2c4c3b] uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  Size Guide
                </h2>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                  All measurements are in inches
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Table */}
            <div className="p-6">
              <p className="text-xs text-gray-400 mb-4" style={{ fontFamily: 'var(--font-body)' }}>
                Choose the size closest to your body measurements for the best fit.
              </p>
              <div className="overflow-x-auto rounded-xl border border-[#e8e4db]">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr style={{ backgroundColor: '#f2f6f1' }}>
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left"
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            color: '#2c4c3b',
                            fontWeight: '700',
                            letterSpacing: '0.05em'
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        className="border-t border-[#e8e4db] hover:bg-[#fdfcfb] transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3"
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              color: cellIndex === 0 ? '#2c4c3b' : '#666',
                              fontWeight: cellIndex === 0 ? '700' : '400'
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tip */}
              <div className="mt-5 p-4 rounded-xl bg-[#f2f6f1] border border-[#d8e6d2]">
                <p className="text-xs text-[#2c4c3b] font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                  💡 <strong>Pro Tip:</strong> If you are between sizes, we recommend sizing up for a more comfortable fit. For fitted silhouettes, size down.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
