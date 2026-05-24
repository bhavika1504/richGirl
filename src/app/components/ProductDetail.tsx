import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from './Navbar';
import { ImageGallery } from './pdp/ImageGallery';
import { ProductInfo } from './pdp/ProductInfo';
import { ProductTabs } from './pdp/ProductTabs';
import { RelatedProducts } from './pdp/RelatedProducts';
import { MobileNav } from './MobileNav';
import { StickyBottomBar } from './pdp/StickyBottomBar';
import { api } from '../services/api';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getProductById(id);
        setProduct(data);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0].name);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0].name);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-[var(--brand-cta-green)] animate-spin" />
        <p className="text-gray-400 font-medium" style={{ fontFamily: 'var(--font-body)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-headline)' }}>Product Not Found</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="px-8 py-3 bg-[var(--brand-dark-text)] text-white rounded-full font-medium"
        >
          BACK TO SHOP
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Navbar />

      {/* Header with Back Button & Breadcrumb */}
      <div className="px-4 lg:px-20 py-6 lg:py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--brand-border)] transition-transform hover:scale-105 active:scale-95 lg:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--brand-dark-text)]" />
        </button>

        <div className="hidden lg:flex items-center gap-2" style={{ fontFamily: 'var(--font-body)', fontSize: '11px' }}>
          <Link to="/" style={{ color: 'var(--brand-secondary-text)' }}>Home</Link>
          <span style={{ color: 'var(--brand-border)' }}>/</span>
          <Link to="/shop" style={{ color: 'var(--brand-secondary-text)' }}>Indian Wear</Link>
          <span style={{ color: 'var(--brand-border)' }}>/</span>
          <Link to="/shop" style={{ color: 'var(--brand-secondary-text)' }}>Kurtis</Link>
          <span style={{ color: 'var(--brand-border)' }}>/</span>
          <span style={{ color: 'var(--brand-dark-text)', fontWeight: '500' }}>{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:px-20 lg:py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left - Image Gallery */}
          <ImageGallery images={product.images} badge={product.badge} />

          {/* Right - Product Info */}
          <div className="px-4 lg:px-0 py-6 lg:py-0">
            <ProductInfo
              product={product}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              quantity={quantity}
              onColorChange={setSelectedColor}
              onSizeChange={setSelectedSize}
              onQuantityChange={setQuantity}
            />
          </div>
        </div>

        {/* Product Tabs */}
        <div className="px-4 lg:px-0 mt-12">
          <ProductTabs product={product} />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts />
        </div>
      </div>

      <MobileNav />
      <StickyBottomBar price={product.price} />
    </div>
  );
}
