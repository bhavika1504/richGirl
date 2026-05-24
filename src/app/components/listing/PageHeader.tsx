import { Link, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  productCount: number;
  showBack?: boolean;
}

export function PageHeader({ breadcrumb, title, productCount, showBack = true }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div
      className="h-24 lg:h-20 flex items-center justify-between px-4 lg:px-20 relative"
      style={{ backgroundColor: 'var(--brand-alt-bg)' }}
    >
      {/* Back Button & Breadcrumb Container */}
      <div className="flex items-center gap-4">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-[var(--brand-border)] transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--brand-dark-text)]" />
          </button>
        )}
        
        {/* Breadcrumb - Desktop */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}>
            {breadcrumb.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {crumb === 'Home' ? (
                  <Link to="/" style={{ color: 'var(--brand-breadcrumb)' }}>{crumb}</Link>
                ) : (
                  <span style={{ color: 'var(--brand-breadcrumb)' }}>{crumb}</span>
                )}
                {index < breadcrumb.length - 1 && (
                  <span className="mx-2 opacity-50" style={{ color: 'var(--brand-border)' }}>/</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Title - Desktop Center, Mobile Top */}
      <h1
        className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 text-center"
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          color: 'var(--brand-dark-text)'
        }}
      >
        {title}
      </h1>

      {/* Product Count - Desktop */}
      <div className="hidden lg:block">
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}>
          {productCount} Products
        </p>
      </div>

      {/* Product Count - Mobile (below title) */}
      <p className="lg:hidden" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}>
        {productCount} Products
      </p>
    </div>
  );
}
