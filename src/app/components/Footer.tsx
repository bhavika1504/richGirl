import { Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer
      className="py-12 lg:py-16"
      style={{ backgroundColor: 'var(--brand-dark-text)' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Column 1 - Brand */}
          <div className="col-span-2 lg:col-span-1">
            <h3
              className="mb-4 tracking-[0.2em]"
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '18px',
                color: 'var(--brand-mist-green)'
              }}
            >
              RICH GIRL
            </h3>
            <p
              className="mb-6 opacity-80"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--brand-mist-green)'
              }}
            >
              Elevating your wardrobe with the finest Indian and Western fashion.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/richgirl1990?igsh=MXFyMGtseXJqNmFheQ%3D%3D"
                className="transition-opacity hover:opacity-70"
                style={{ color: 'var(--brand-mist-green)' }}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/rich.girl.fashion.hub.1990/"
                className="transition-opacity hover:opacity-70"
                style={{ color: 'var(--brand-mist-green)' }}
              >
                <Facebook className="w-5 h-5" />
              </a>

            </div>
          </div>

          {/* Column 2 - Shop */}
          <div>
            <h4
              className="mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--brand-mist-green)'
              }}
            >
              Shop
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Indian Wear', path: '/shop/indian' },
                { label: 'Western Wear', path: '/shop/western' },
                { label: 'New Arrivals', path: '/shop?sort=Newest' },
                { label: 'Best Sellers', path: '/shop?sort=Popularity' },
                { label: 'Sale', path: '/shop?sale=true' }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="transition-opacity hover:opacity-70"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--brand-cta-green)'
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Help */}
          <div>
            <h4
              className="mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--brand-mist-green)'
              }}
            >
              Help
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Shipping Info', path: '#' },
                { label: 'Returns', path: '#' },
                { label: 'Size Guide', path: '#' },
                { label: 'Track Order', path: '/track' },
                { label: 'Contact Us', path: 'mailto:customerrichgirl@gmail.com' }
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="transition-opacity hover:opacity-70"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--brand-cta-green)'
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - About */}
          <div>
            <h4
              className="mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--brand-mist-green)'
              }}
            >
              About
            </h4>
            <ul className="space-y-2">
              {['Our Story', 'Sustainability', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="transition-opacity hover:opacity-70"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--brand-cta-green)'
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-8 border-t text-center"
          style={{ borderColor: 'rgba(232, 245, 228, 0.2)' }}
        >
          <p
            className="opacity-70"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--brand-mist-green)'
            }}
          >
            © 2026 Rich Girl — House of Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
