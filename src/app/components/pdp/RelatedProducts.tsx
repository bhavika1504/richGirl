import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { api } from '../../services/api';

interface RelatedProduct {
  id: string | number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  category?: string;
}

interface RelatedProductsProps {
  category?: string;
  currentProductId?: string | number;
}

export function RelatedProducts({ category, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true);
      try {
        // Fetch products by category if available, otherwise fetch all
        const data = await api.getProducts(category);

        if (Array.isArray(data)) {
          // Filter out the current product and limit to 4
          const filtered = data
            .filter((p: any) => (p.id || p._id) !== currentProductId)
            .slice(0, 4)
            .map((p: any) => ({
              id: p.id || p._id,
              name: p.name,
              image: p.image || (p.images && p.images[0]),
              price: p.price,
              originalPrice: p.originalPrice
            }));

          setProducts(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [category, currentProductId]);

  if (loading) {
    return (
      <div className="px-4 lg:px-20 py-10 text-center text-gray-400">
        Loading recommendations...
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if no related products
  }

  return (
    <div className="px-4 lg:px-20">
      <h2
        className="mb-8"
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(24px, 3vw, 28px)',
          color: 'var(--brand-dark-text)'
        }}
      >
        You May Also Like
      </h2>

      <div className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-0 px-4 lg:px-0">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-5 lg:min-w-0 min-w-max lg:w-auto w-[calc(100vw+200px)]">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-2xl overflow-hidden border group cursor-pointer block"
              style={{ borderColor: 'var(--brand-mist-green)', minWidth: '168px' }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: 'var(--brand-alt-bg)' }}
                />
              </div>
              <div className="p-3">
                <h3
                  className="mb-2 truncate"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--brand-dark-text)'
                  }}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-price)',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--brand-dark-text)'
                    }}
                  >
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span
                      className="line-through"
                      style={{
                        fontFamily: 'var(--font-price)',
                        fontSize: '12px',
                        color: '#888'
                      }}
                    >
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
