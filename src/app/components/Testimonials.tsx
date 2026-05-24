import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    quote: 'The quality is exceptional! Love how they blend traditional and modern styles perfectly.',
    rating: 5
  },
  {
    id: 2,
    name: 'Ananya Kapoor',
    quote: 'My go-to store for both ethnic and western wear. Always on-trend and comfortable.',
    rating: 5
  },
  {
    id: 3,
    name: 'Meera Reddy',
    quote: 'Fast delivery and beautiful packaging. Every piece feels premium and luxurious.',
    rating: 5
  },
];

export function Testimonials() {
  return (
    <section
      className="py-10 lg:py-14"
      style={{ backgroundColor: 'var(--brand-alt-bg)' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <h2
          className="mb-10 text-center uppercase tracking-wide inline-block mx-auto"
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(28px, 3vw, 36px)',
            color: 'var(--brand-dark-text)',
            fontWeight: '700',
            borderBottom: '3px solid var(--brand-cta-green)',
            paddingBottom: '8px',
            display: 'block',
            width: 'fit-content'
          }}
        >
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 lg:p-8"
              style={{ borderRadius: '14px' }}
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{ color: 'var(--brand-cta-green)' }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="mb-6 italic"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--brand-dark-text)',
                  opacity: 0.9
                }}
              >
                "{testimonial.quote}"
              </p>

              {/* Customer Name */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--brand-dark-text)'
                }}
              >
                {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
