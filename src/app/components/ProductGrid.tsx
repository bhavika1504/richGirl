import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../services/api';

interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  sizes: any[];
  discount?: number;
  createdAt?: string;
  ratings?: {
    average: number;
    count: number;
  };
}

// Format 1 Card (Rounded Rectangle)
function ProductCardFormat1({ product, index, badge, darkTheme = false, isSliding = false }: { product: Product; index: number; badge?: { text: string; className: string }; darkTheme?: boolean; isSliding?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const netPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group flex flex-col cursor-pointer ${isSliding ? 'w-[165px] sm:w-[220px] md:w-[260px] lg:w-[280px] flex-shrink-0 snap-start' : 'w-full max-w-[165px] sm:max-w-[240px] md:max-w-[300px] lg:max-w-[340px] mx-auto'}`}
    >
      <Link to={`/product/${product.id}`} className="w-full flex flex-col">
        <div
          className="relative overflow-hidden w-full mb-3 lg:mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300 bg-[#f5f5f5]"
          style={{ aspectRatio: '3/4', borderRadius: '16px' }}
        >
          {badge && (
            <span className={`absolute top-3 left-3 lg:top-4 lg:left-4 px-2.5 py-1 text-[10px] lg:text-[11px] font-bold tracking-widest rounded-full uppercase z-10 shadow-sm ${badge.className}`} style={{ fontFamily: 'var(--font-body)' }}>
              {badge.text}
            </span>
          )}
          <img
            src={product.image || (product.images && product.images[0]) || ''}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        <h3
          className="mb-1 lg:mb-1.5 w-full truncate font-bold"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2.2vw, 16px)', color: darkTheme ? '#f7f5f0' : '#2c4c3b' }}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-2.5">
          <span style={{ fontFamily: 'var(--font-price)', fontSize: 'clamp(15px, 2.2vw, 17px)', color: darkTheme ? '#a4b49d' : '#2c4c3b', fontWeight: '800' }}>
            ₹{netPrice.toLocaleString()}
          </span>
          {(product.discount || 0) > 0 && (
            <span className="line-through text-gray-400" style={{ fontFamily: 'var(--font-price)', fontSize: 'clamp(12px, 1.8vw, 14px)' }}>
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// Format 1 Section
function ProductSectionFormat1({ title, subtitle, products, badgeGetter }: any) {
  if (products.length === 0) return null;
  const isSliding = products.length > 2;

  return (
    <section className="py-8 lg:py-14 bg-[#fdfcfb] border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        <div className="flex flex-col items-center text-center mb-6 lg:mb-12 relative">
          <h2 className="uppercase tracking-widest text-[#2c4c3b] mb-1.5 lg:mb-2 font-bold" style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(22px, 4vw, 32px)' }}>
            {title}
          </h2>
          <p className="text-gray-500" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
            {subtitle}
          </p>
          <Link to="/shop" className="text-[12px] lg:text-[13px] font-bold tracking-widest text-[#2c4c3b] hover:text-[#4a725b] transition-colors absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5">
            VIEW ALL <span>→</span>
          </Link>
        </div>

        {isSliding ? (
          <div
            className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-0 px-4 lg:px-0 snap-x snap-mandatory pb-4 lg:pb-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-4 lg:gap-6 min-w-max">
              {products.map((product: any, index: number) => (
                <ProductCardFormat1 key={product.id} product={product} index={index} badge={badgeGetter(product)} isSliding={true} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 lg:gap-x-6 lg:gap-y-10 justify-center max-w-[720px] mx-auto">
            {products.map((product: any, index: number) => (
              <ProductCardFormat1 key={product.id} product={product} index={index} badge={badgeGetter(product)} isSliding={false} />
            ))}
          </div>
        )}

        <div className="mt-6 lg:mt-10 text-center lg:hidden">
          <Link to="/shop" className="text-[12px] font-bold tracking-widest text-[#2c4c3b] inline-flex items-center gap-1.5 border-b border-[#2c4c3b] pb-0.5">
            VIEW ALL <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function NewArrivalsSection({ products, badgeGetter }: any) {
  if (products.length === 0) return null;
  const isSliding = products.length > 2;

  return (
    <section className="bg-[#293526] py-8 lg:py-14 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12">
        <div className="flex flex-col items-center text-center mb-8 lg:mb-14 relative">


          {/* Main Title - Image Styled Bold Graphic Display */}
          <h2
            className="text-[#f7f5f0] uppercase tracking-wider font-extrabold leading-none my-1"
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(36px, 7.5vw, 68px)',
              letterSpacing: '-0.02em'
            }}
          >
            NEW ARRIVALS
          </h2>



          <Link to="/shop" className="text-[12px] lg:text-[13px] font-bold tracking-widest text-[#f7f5f0] hover:text-white transition-colors absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1.5">
            VIEW ALL <span>→</span>
          </Link>
        </div>

        {isSliding ? (
          <div
            className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-0 px-4 lg:px-0 snap-x snap-mandatory pb-4 lg:pb-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-4 lg:gap-6 min-w-max">
              {products.map((product: any, index: number) => (
                <ProductCardFormat1 key={product.id} product={product} index={index} badge={badgeGetter(product)} darkTheme={true} isSliding={true} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 lg:gap-x-6 lg:gap-y-10 justify-center max-w-[720px] mx-auto">
            {products.map((product: any, index: number) => (
              <ProductCardFormat1 key={product.id} product={product} index={index} badge={badgeGetter(product)} darkTheme={true} isSliding={false} />
            ))}
          </div>
        )}

        <div className="mt-6 lg:mt-10 text-center lg:hidden">
          <Link to="/shop" className="text-[12px] font-bold tracking-widest text-[#f7f5f0] inline-flex items-center gap-1.5 border-b border-[#f7f5f0] pb-0.5">
            VIEW ALL <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        if (Array.isArray(data)) setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center bg-[#fdfcfb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c4c3b]"></div>
      </div>
    );
  }

  // 1. New Arrivals: newest by createdAt (max 8-10 products)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10);

  // 2. Best Sellers: highest ratings.count (max 8-10 products)
  const bestSellers = [...products]
    .sort((a, b) => ((b.ratings?.count || 0) - (a.ratings?.count || 0)))
    .slice(0, 10);

  // 3. Premium Collection: highest price (max 8-10 products)
  const premiumProducts = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 10);

  // 4. Deals of the Day: highest discount (max 8-10 products)
  const dealProducts = [...products]
    .filter(p => (p.discount || 0) > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 10);

  return (
    <>
      <NewArrivalsSection
        products={newArrivals}
        badgeGetter={() => ({ text: 'NEW', className: 'bg-[#a4b49d] text-white' })}
      />

      <ProductSectionFormat1
        title="Best Sellers"
        subtitle="Our most loved styles this season."
        products={bestSellers}
        badgeGetter={() => ({ text: 'HOT', className: 'bg-red-50 text-red-600 border border-red-100' })}
      />

      <ProductSectionFormat1
        title="Premium Collection"
        subtitle="Exclusive fabrics and intricate craftsmanship."
        products={premiumProducts}
        badgeGetter={() => ({ text: 'LUXE', className: 'bg-amber-50 text-amber-600 border border-amber-100' })}
      />

      <ProductSectionFormat1
        title="Deals of the Day"
        subtitle="Incredible styles at unbeatable prices."
        products={dealProducts}
        badgeGetter={(product: Product) => ({
          text: `${product.discount}% OFF`,
          className: 'bg-green-50 text-green-600 border border-green-100'
        })}
      />
    </>
  );
}
