import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from './Navbar';
import { ImageGallery } from './pdp/ImageGallery';
import { ProductInfo } from './pdp/ProductInfo';
import { ProductTabs } from './pdp/ProductTabs';
import { RelatedProducts } from './pdp/RelatedProducts';
import { motion, AnimatePresence } from 'motion/react';
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

        // Extract unique color labels if not present in data.colors
        let availableColors = data.colors || [];
        if (!availableColors.length && data.sizes?.length) {
          availableColors = Array.from(new Set(
            data.sizes.flatMap((s: any) => s.variants?.map((v: any) => v.colorLabel || v.color) || [])
          )).filter(Boolean);
          data.colors = availableColors;
        }

        setProduct(data);

        // Auto-select first in-stock size and color
        if (data.sizes?.length > 0) {
          const firstSize = data.sizes.find((s: any) => s.variants?.some((v: any) => v.stock > 0)) || data.sizes[0];
          setSelectedSize(firstSize.size || firstSize.name || firstSize);

          if (firstSize.variants?.length > 0) {
            const firstVariant = firstSize.variants.find((v: any) => v.stock > 0) || firstSize.variants[0];
            const firstColor = firstVariant.colorLabel || firstVariant.color;
            if (firstColor) setSelectedColor(firstColor);
          } else if (availableColors.length > 0) {
            setSelectedColor(availableColors[0].name || availableColors[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Ensure color is valid when size changes
  useEffect(() => {
    if (!product || !selectedSize || !product.sizes) return;

    const currentSizeObj = product.sizes.find((s: any) => (s.size || s.name || s) === selectedSize);
    if (!currentSizeObj) return;

    const isColorStillAvailable = currentSizeObj.variants?.some(
      (v: any) => (v.colorLabel || v.color) === selectedColor && v.stock > 0
    );

    if (!isColorStillAvailable && currentSizeObj.variants?.length > 0) {
      const firstAvailableVariant = currentSizeObj.variants.find((v: any) => v.stock > 0) || currentSizeObj.variants[0];
      const newColor = firstAvailableVariant.colorLabel || firstAvailableVariant.color;
      if (newColor) setSelectedColor(newColor);
    }
  }, [selectedSize, product]);

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
          {(() => {
            // Build a map of colorLabel -> first image (front/colour-specific view)
            const colorImageMap: Record<string, string> = {};
            product.sizes?.forEach((sz: any) => {
              sz.variants?.forEach((v: any) => {
                const label = v.colorLabel || v.color;
                if (label && v.images && v.images.length > 0 && !colorImageMap[label]) {
                  colorImageMap[label] = v.images[0];
                }
              });
            });
            // Global images = side/back images (indices 1+); index 0 is colour-specific front
            const globalImages = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
            return (
              <ImageGallery
                images={globalImages}
                badge={product.badge}
                selectedColor={selectedColor}
                colorImageMap={colorImageMap}
              />
            );
          })()}

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
          <RelatedProducts category={product.category} currentProductId={product.id} />
        </div>
      </div>

      <StickyBottomBar price={product.price || 0} />
    </div>
  );
}
