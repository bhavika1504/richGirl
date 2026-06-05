export function IndianWearBanner() {
  return (
    <section
      className="py-12 lg:py-16 relative overflow-hidden"
      style={{ backgroundColor: 'var(--brand-dark-text)' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="max-w-xl z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h2
              className="mb-4 uppercase tracking-wide"
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                lineHeight: '1.2',
                color: 'var(--brand-mist-green)',
                fontWeight: '700',
                borderBottom: '3px solid var(--brand-cta-green)',
                paddingBottom: '8px',
                display: 'inline-block'
              }}
            >
              Embrace Your Heritage
            </h2>
            <p
              className="mb-6 opacity-90"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--brand-mist-green)'
              }}
            >
              From timeless kurta sets to contemporary fusion wear,
              our Indian collection celebrates tradition with a modern twist.
            </p>
            <button
              className="px-8 py-3 text-white transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--brand-cta-green)',
                borderRadius: '28px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Explore Indian Wear
            </button>
          </div>

          {/* Right - Rotated Product Images */}
          <div className="relative w-full lg:w-auto flex justify-center lg:justify-end">
            <div className="relative" style={{ width: '300px', height: '300px' }}>
              {/* Image 1 */}
              <div
                className="absolute top-0 right-0 overflow-hidden shadow-xl"
                style={{
                  width: '140px',
                  height: '180px',
                  borderRadius: '12px',
                  transform: 'rotate(8deg)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1759840278361-f1adc75529a1?w=300"
                  alt="Indian Wear"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image 2 */}
              <div
                className="absolute top-12 left-0 overflow-hidden shadow-xl"
                style={{
                  width: '140px',
                  height: '180px',
                  borderRadius: '12px',
                  transform: 'rotate(-6deg)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1708534246051-7f47b279e94b?w=300"
                  alt="Indian Wear"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image 3 */}
              <div
                className="absolute bottom-0 right-8 overflow-hidden shadow-xl"
                style={{
                  width: '140px',
                  height: '180px',
                  borderRadius: '12px',
                  transform: 'rotate(4deg)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=300"
                  alt="Indian Wear"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
