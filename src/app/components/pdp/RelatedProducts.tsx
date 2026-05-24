const relatedProducts = [
  {
    id: 1,
    name: 'Embroidered Kurta',
    image: 'https://images.unsplash.com/photo-1708534419572-6e6614a53ca1?w=300',
    price: 2299,
    originalPrice: 2899
  },
  {
    id: 2,
    name: 'Cotton Kurti Set',
    image: 'https://images.unsplash.com/photo-1708534246055-d7b149acb731?w=300',
    price: 2799
  },
  {
    id: 3,
    name: 'Printed Kurta',
    image: 'https://images.unsplash.com/photo-1597983073540-684a10b15ab1?w=300',
    price: 1899
  },
  {
    id: 4,
    name: 'Silk Kurta',
    image: 'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=300',
    price: 3499
  }
];

export function RelatedProducts() {
  return (
    <div className="px-4 lg:px-20">
      <h2
        className="mb-8"
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(24px, 3vw, 28px)',
          color: 'var(--brand-dark-text)'
        }}
      >
        You May Also Like
      </h2>

      <div className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-0 px-4 lg:px-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:min-w-0 min-w-max lg:w-auto w-[calc(100vw+200px)]">
          {relatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden border group cursor-pointer"
              style={{ borderColor: 'var(--brand-mist-green)', minWidth: '168px' }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: 'var(--brand-alt-bg)' }}
                />
              </div>
              <div className="p-3">
                <h3
                  className="mb-2 truncate"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--brand-dark-text)'
                  }}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-price)',
                      fontSize: '14px',
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
                        fontSize: '12px',
                        color: '#888'
                      }}
                    >
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
