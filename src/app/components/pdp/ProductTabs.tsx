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
        {['description', 'sizeChart', 'reviews'].map((tab) => (
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
            {tab === 'reviews' && `Reviews (${product.ratings?.count || 0})`}

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

        {activeTab === 'sizeChart' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--brand-mist-green)' }}>
                  {['Size', 'Chest', 'Waist', 'Hip', 'Length'].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2.5 text-left"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--brand-dark-text)',
                        fontWeight: '500'
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS', '32"', '26"', '34"', '45"'],
                  ['S', '34"', '28"', '36"', '46"'],
                  ['M', '36"', '30"', '38"', '47"'],
                  ['L', '38"', '32"', '40"', '48"'],
                  ['XL', '40"', '34"', '42"', '49"'],
                  ['XXL', '42"', '36"', '44"', '50"']
                ].map((row, index) => (
                  <tr
                    key={index}
                    style={{ backgroundColor: index % 2 === 0 ? 'white' : 'var(--brand-alt-bg)' }}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-2.5"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          color: 'var(--brand-dark-text)'
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
        )}

        {activeTab === 'reviews' && (
          <div>
            {/* Rating Summary */}
            <div className="flex items-start gap-8 mb-8 pb-8" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
              <div className="text-center">
                <div
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '48px',
                    color: 'var(--brand-dark-text)'
                  }}
                >
                  {product.ratings?.average || 0}
                </div>
                <div className="flex gap-1 mb-2">
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
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--brand-secondary-text)' }}>
                  {product.ratings?.count || 0} reviews
                </p>
              </div>

              {/* Rating Bars */}
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-dark-text)', width: '20px' }}>
                      {stars}★
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--brand-border)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: 'var(--brand-cta-green)',
                          width: `${Math.random() * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
              {[
                { name: 'Priya Sharma', rating: 5, date: '2 days ago', review: 'Absolutely loved the fabric quality! Perfect for daily wear and the fit is just right.' },
                { name: 'Ananya M.', rating: 4, date: '1 week ago', review: 'Beautiful print and very comfortable. Only wish it came in more colors!' },
                { name: 'Meera K.', rating: 5, date: '2 weeks ago', review: 'Excellent purchase! The cotton is soft and breathable. Highly recommend.' }
              ].map((review, index) => (
                <div key={index} className="flex gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--brand-mist-green)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--brand-dark-text)',
                      fontWeight: '500'
                    }}
                  >
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '500', color: 'var(--brand-dark-text)' }}>
                        {review.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}>
                        {review.date}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '14px',
                            color: i < review.rating ? 'var(--brand-cta-green)' : 'var(--brand-border)'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: '1.6', color: 'var(--brand-dark-text)' }}>
                      {review.review}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
