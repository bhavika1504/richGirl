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
function ProductCardFormat1({ product, index, badge }: { product: Product; index: number; badge?: { text: string; className: string } }) {
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
      className="group flex flex-col cursor-pointer"
    >
      <Link to={`/product/${product.id}`} className="w-full flex flex-col">
        <div 
          className="relative overflow-hidden w-full mb-3 lg:mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300 bg-[#f5f5f5] max-h-[160px] lg:max-h-[240px]"
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
          style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2.2vw, 16px)', color: '#2c4c3b' }}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2.5">
          <span style={{ fontFamily: 'var(--font-price)', fontSize: 'clamp(15px, 2.2vw, 17px)', color: '#2c4c3b', fontWeight: '800' }}>
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
        
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-x-2 gap-y-4 lg:gap-x-6 lg:gap-y-10">
          {products.map((product: any, index: number) => (
            <ProductCardFormat1 key={product.id} product={product} index={index} badge={badgeGetter(product)} />
          ))}
        </div>
        <div className="mt-6 lg:mt-10 text-center lg:hidden">
          <Link to="/shop" className="text-[12px] font-bold tracking-widest text-[#2c4c3b] inline-flex items-center gap-1.5 border-b border-[#2c4c3b] pb-0.5">
             VIEW ALL <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Format 2 Section (New Arrivals)
function NewArrivalsSection({ products, badgeGetter }: any) {
  if (products.length === 0) return null;
  return (
    <section className="bg-[#293526] py-6 lg:py-16 overflow-hidden relative border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-12 flex flex-col lg:flex-row items-center gap-4 lg:gap-14 relative z-10">
        
        {/* Left Banner Info */}
        <div className="lg:w-1/4 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 mb-0">
          <p className="text-[#a4b49d] uppercase tracking-[0.25em] text-[11px] lg:text-[12px] font-bold mb-2 lg:mb-3 hidden lg:block">Just Landed</p>
          <h2 className="text-[#f7f5f0] leading-tight mb-0 lg:mb-4" style={{ fontFamily: 'var(--font-lobster)', fontSize: 'clamp(32px, 5.5vw, 48px)' }}>
            New Arrivals
          </h2>
          <p className="text-[#d0d8cc] italic hidden lg:block" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
            Be the first to own the latest trends.
          </p>
          <Link to="/shop" className="mt-8 lg:mt-10 text-[#f7f5f0] text-[12px] lg:text-[13px] font-bold tracking-widest hover:text-white transition-colors border-b border-[#f7f5f0]/30 hover:border-white pb-1 hidden lg:inline-flex items-center gap-2">
             VIEW ALL COLLECTION <span>→</span>
          </Link>
        </div>

        {/* Right Scrolling Products */}
        <div className="lg:w-3/4 w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 lg:pb-4">
          <div className="flex gap-3 lg:gap-6 w-max pe-4 lg:pe-12">
            {products.map((product: any, index: number) => {
               const badge = badgeGetter(product);
               return (
                 <motion.div key={product.id} initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ delay: index*0.1 }} className="snap-start w-[120px] lg:w-[180px]">
                   <Link to={`/product/${product.id}`} className="group flex flex-col">
                     <div 
                       className="relative overflow-hidden w-full mb-3 bg-black/20 transition-transform duration-300 group-hover:-translate-y-2" 
                       style={{ aspectRatio: '3/4', borderRadius: '14px' }}
                     >
                       {badge && (
                         <span className="absolute top-2.5 left-2.5 lg:top-3 lg:left-3 px-2 py-0.5 text-[9px] lg:text-[10px] font-bold tracking-widest rounded-full uppercase z-10 bg-[#a4b49d] text-white">
                           {badge.text}
                         </span>
                       )}
                       <img src={product.image || (product.images && product.images[0]) || ''} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     </div>
                     <h3 className="mb-1 w-full truncate text-[#f7f5f0] font-bold" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(13px, 2vw, 15px)' }}>
                       {product.name}
                     </h3>
                     <p className="text-[#a4b49d]" style={{ fontFamily: 'var(--font-price)', fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '700' }}>
                       ₹{Math.round(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}
                     </p>
                   </Link>
                 </motion.div>
               )
            })}
          </div>
        </div>
        
        <Link to="/shop" className="text-[#f7f5f0] text-[12px] font-bold tracking-widest hover:text-white transition-colors border-b border-[#f7f5f0]/30 hover:border-white pb-1 inline-flex items-center gap-2 lg:hidden mt-2">
           VIEW ALL COLLECTION <span>→</span>
        </Link>
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

  // 1. New Arrivals: newest by createdAt
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  // 2. Best Sellers: highest ratings.count (fallback to arbitrary if missing)
  const bestSellers = [...products]
    .sort((a, b) => ((b.ratings?.count || 0) - (a.ratings?.count || 0)))
    .slice(0, 4);

  // 3. Premium Collection: highest price
  const premiumProducts = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  // 4. Deals of the Day: highest discount
  const dealProducts = [...products]
    .filter(p => (p.discount || 0) > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 4);

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
