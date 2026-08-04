import { useState } from 'react';
import { motion } from 'motion/react';

interface ProductTabsProps {
  product: any;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex gap-8 border-b mb-6" style={{ borderColor: 'var(--brand-border)' }}>
        {['description', 'sizeChart'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative pb-3"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: activeTab === tab ? 'var(--brand-dark-text)' : 'var(--brand-secondary-text)',
              fontWeight: activeTab === tab ? '500' : '400'
            }}
          >
            {tab === 'description' && 'Description'}
            {tab === 'sizeChart' && 'Size Chart'}

            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--brand-cta-green)' }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === 'description' && (
          <div className="space-y-3" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: '1.8', color: 'var(--brand-dark-text)' }}>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>
        )}

        {activeTab === 'sizeChart' && (() => {
          const DEFAULT_HEADERS = ['Size', 'Chest', 'Waist', 'Hip', 'Length'];
          const DEFAULT_ROWS = [
            ['XS', '32"', '26"', '34"', '45"'],
            ['S', '34"', '28"', '36"', '46"'],
            ['M', '36"', '30"', '38"', '47"'],
            ['L', '38"', '32"', '40"', '48"'],
            ['XL', '40"', '34"', '42"', '49"'],
            ['2XL', '42"', '36"', '44"', '50"'],
            ['3XL', '44"', '38"', '46"', '51"'],
            ['4XL', '46"', '40"', '48"', '52"'],
          ];
          const headers = product.sizeGuide?.headers || DEFAULT_HEADERS;
          const rows = product.sizeGuide?.rows || DEFAULT_ROWS;
          return (
            <div className="overflow-x-auto">
              <p className="text-[11px] text-gray-400 mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                All measurements are in inches. Choose the size closest to your measurements.
              </p>
              <table className="w-full" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--brand-mist-green)' }}>
                    {headers.map((header: string) => (
                      <th
                        key={header}
                        className="px-4 py-2.5 text-left"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          color: 'var(--brand-dark-text)',
                          fontWeight: '600'
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: string[], index: number) => (
                    <tr
                      key={index}
                      style={{ backgroundColor: index % 2 === 0 ? 'white' : 'var(--brand-alt-bg)' }}
                    >
                      {row.map((cell: string, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2.5"
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--brand-dark-text)',
                            fontWeight: cellIndex === 0 ? '600' : '400'
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
          );
        })()}
      </div>
    </div>
  );
}
