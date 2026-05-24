import { Home as HomeIcon, Search, Grid, ShoppingCart, User } from 'lucide-react';
import { Link } from 'react-router';

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50"
      style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
    >
      <div className="flex items-center justify-around px-4 py-3">
        <Link to="/" className="flex flex-col items-center gap-1">
          <HomeIcon className="w-5 h-5" style={{ color: 'var(--brand-dark-text)' }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--brand-dark-text)'
            }}
          >
            Home
          </span>
        </Link>

        <button className="flex flex-col items-center gap-1">
          <Search className="w-5 h-5" style={{ color: 'var(--brand-dark-text)' }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--brand-dark-text)'
            }}
          >
            Search
          </span>
        </button>

        <Link to="/shop" className="flex flex-col items-center gap-1">
          <Grid className="w-5 h-5" style={{ color: 'var(--brand-dark-text)' }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--brand-dark-text)'
            }}
          >
            Shop
          </span>
        </Link>

        <Link to="/cart" className="flex flex-col items-center gap-1 relative">
          <ShoppingCart className="w-5 h-5" style={{ color: 'var(--brand-dark-text)' }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--brand-dark-text)'
            }}
          >
            Cart
          </span>
          <span
            className="absolute -top-1 right-2 w-4 h-4 rounded-full text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--brand-cta-green)',
              fontSize: '9px',
              fontFamily: 'var(--font-body)'
            }}
          >
            3
          </span>
        </Link>

        <Link to="/profile" className="flex flex-col items-center gap-1">
          <User className="w-5 h-5" style={{ color: 'var(--brand-dark-text)' }} />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--brand-dark-text)'
            }}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}
