const westernProducts = [
  {
    id: 1,
    name: 'Classic White Top',
    price: 1799,
    image: 'https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=300'
  },
  {
    id: 2,
    name: 'Mint Green Tee',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1759572095329-1dcf9522762b?w=300'
  },
  {
    id: 3,
    name: 'Casual Co-ord',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1611042553484-d61f84d22784?w=300'
  },
  {
    id: 4,
    name: 'Chic Dress',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=300'
  },
];

export function WesternWear() {
  return (
    <section className="py-12 lg:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Large Editorial Photo */}
          <div className="relative overflow-hidden" style={{ borderRadius: '14px' }}>
            <img
              src="https://images.unsplash.com/photo-1584059180431-a85a4434d166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
              alt="Western Fashion"
              className="w-full h-full object-cover min-h-[500px] lg:min-h-[600px]"
            />
          </div>

          {/* Right - 2x2 Mini Product Grid */}
          <div className="flex flex-col justify-center">
            <h2
              className="mb-8"
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(22px, 3vw, 26px)',
                color: 'var(--brand-dark-text)'
              }}
            >
              Western Vibes
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {westernProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div
                    className="overflow-hidden mb-3 relative"
                    style={{ borderRadius: '14px' }}
                  >
                    <div style={{ aspectRatio: '3/4' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--brand-dark-text)'
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-price)',
                      fontSize: '14px',
                      color: 'var(--brand-cta-green)',
                      fontWeight: '500'
                    }}
                  >
                    ₹{product.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
