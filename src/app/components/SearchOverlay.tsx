import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { api } from '../services/api';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // For now, we'll search across all products and filter locally
        // In a real app, this would be a backend call: /api/products/search?q=...
        const allProducts = await api.getProducts();
        const filtered = allProducts.filter((p: any) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 5));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Search Panel */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-white z-[101] shadow-2xl pb-8"
          >
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center h-20 gap-4">
                <SearchIcon className="w-6 h-6 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for kurtas, tops, co-ords..."
                  className="flex-1 bg-transparent border-none outline-none text-xl font-medium placeholder:text-gray-300"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Results */}
              <div className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[var(--brand-cta-green)] animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid gap-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Suggestions</p>
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 py-3 px-4 hover:bg-[var(--brand-mist-green)] rounded-lg transition-colors group"
                      >
                        <SearchIcon className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <h4 className="text-[var(--brand-dark-text)]" style={{ fontFamily: 'var(--font-headline)' }}>
                            {product.name}
                          </h4>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    ))}
                    <Link
                      to="/shop"
                      onClick={onClose}
                      className="mt-4 px-4 py-3 text-sm font-bold text-[var(--brand-cta-green)] hover:bg-[var(--brand-alt-bg)] rounded-lg transition-colors flex items-center justify-between group"
                    >
                      VIEW ALL PRODUCTS
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                ) : query && !loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400" style={{ fontFamily: 'var(--font-body)' }}>No results found for "{query}"</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Popular Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {['Kurtas', 'Tops', 'Co-ords', 'Indian Wear'].map((cat) => (
                        <Link
                          key={cat}
                          to="/shop"
                          onClick={onClose}
                          className="px-4 py-2 bg-[var(--brand-alt-bg)] hover:bg-[var(--brand-mist-green)] rounded-full text-sm font-medium transition-colors"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
