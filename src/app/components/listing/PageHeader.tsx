import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';

interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  productCount: number;
  showBack?: boolean;
  category?: string;
  activeSizeGroup?: 'regular' | 'plus' | null;
  onSelectSizeGroup?: (group: 'regular' | 'plus') => void;
}

export function PageHeader({
  breadcrumb,
  title,
  productCount,
  showBack = true,
  category,
  activeSizeGroup,
  onSelectSizeGroup
}: PageHeaderProps) {
  const navigate = useNavigate();
  const isIndianOrWestern = category === 'indian' || category === 'western' || title.toLowerCase().includes('indian') || title.toLowerCase().includes('western');

  return (
    <div
      className="py-5 lg:py-6 px-4 lg:px-20 relative flex flex-col justify-center gap-4 transition-all"
      style={{ backgroundColor: 'var(--brand-alt-bg)', borderBottom: '1px solid var(--brand-border)' }}
    >
      <div className="flex items-center justify-between w-full relative">
        {/* Back Button & Breadcrumb Container */}
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-white rounded-full shadow-sm flex items-center justify-center border border-[var(--brand-border)] transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--brand-dark-text)]" />
            </button>
          )}

          {/* Breadcrumb - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 font-semibold" style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}>
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

        {/* Title - Desktop Center */}
        <h1
          className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 text-center font-bold"
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(22px, 3vw, 32px)',
            color: 'var(--brand-dark-text)'
          }}
        >
          {title}
        </h1>

        {/* Product Count - Desktop */}
        <div className="hidden lg:block">
          <p className="font-semibold" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--brand-secondary-text)' }}>
            {productCount} Products
          </p>
        </div>

        {/* Product Count - Mobile */}
        <p className="lg:hidden font-semibold" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--brand-secondary-text)' }}>
          {productCount} Products
        </p>
      </div>

      {/* 2-Column Size Direct Filter Bar for Indian & Western Wear */}
      {isIndianOrWestern && onSelectSizeGroup && (
        <div className="w-full max-w-md mx-auto mt-1 px-1">
          <div className="grid grid-cols-2 gap-2 bg-white/90 p-1.5 rounded-2xl border border-[var(--brand-border)] shadow-sm">
            <button
              type="button"
              onClick={() => onSelectSizeGroup('regular')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSizeGroup === 'regular'
                  ? 'bg-[var(--brand-dark-text)] text-white shadow-md'
                  : 'bg-[var(--brand-mist-green)] text-[var(--brand-dark-text)] hover:bg-emerald-100/70'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Regular Size (XS-2XL)
            </button>

            <button
              type="button"
              onClick={() => onSelectSizeGroup('plus')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSizeGroup === 'plus'
                  ? 'bg-[var(--brand-dark-text)] text-white shadow-md'
                  : 'bg-[var(--brand-mist-green)] text-[var(--brand-dark-text)] hover:bg-emerald-100/70'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Plus Size (3XL+)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
