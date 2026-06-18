import { ShoppingCart, User, Menu, Search, X, Flower2, Shirt, LayoutGrid, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { SearchOverlay } from "./SearchOverlay";
import { api } from "../services/api";
import AuthPromptModal from "./AuthPromptModal";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const cartItems = await api.getCart();
        const totalItems = Array.isArray(cartItems)
          ? cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
          : 0;
        setCartCount(totalItems);
      } catch (err) {
        console.error("Failed to load cart count:", err);
      }
    };
    fetchCartCount();
    const interval = setInterval(fetchCartCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUserClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      setIsAuthPromptOpen(true);
    }
  };

  return (
    <>
      <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
        <div className="max-w-[1440px] mx-auto px-4 lg:px-12 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" style={{ color: "var(--brand-dark-text)" }} />
          </button>

          {/* Left Nav Links - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/shop/indian" className="relative group px-4 py-2 rounded-full transition-all" style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--brand-dark-text)",
              backgroundColor: "var(--brand-mist-green)"
            }}>
              Indian Wear
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--brand-cta-green)] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
            <Link to="/shop/western" className="relative group px-4 py-2 rounded-full transition-all hover:bg-emerald-50" style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--brand-dark-text)",
              backgroundColor: "var(--brand-mist-green)"
            }}>
              Western Wear
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--brand-cta-green)] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          </div>

          {/* Center Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src="/assets/richgirl_logo.png"
              alt="RICH GIRL"
              className="h-14 lg:h-18 w-auto object-contain"
            />
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-1 lg:gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 lg:p-2 hover:bg-[#F8F9F8] rounded-full transition-colors hidden lg:block"
            >
              <Search className="w-5 h-5" style={{ color: "var(--brand-dark-text)" }} />
            </button>
            <Link to="/cart" className="p-2 relative">
              <ShoppingCart className="w-5 h-5" style={{ color: "var(--brand-dark-text)" }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center animate-bounce" style={{
                  backgroundColor: "var(--brand-cta-green)",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px"
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={handleUserClick} className="p-2 hidden lg:block">
              <User className="w-5 h-5" style={{ color: "var(--brand-dark-text)" }} />
            </button>
          </div>
        </div>

        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <AuthPromptModal isOpen={isAuthPromptOpen} onClose={() => setIsAuthPromptOpen(false)} />
      </nav>

      {/* Mobile Slide-Out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <img
                src="/assets/richgirl_logo.png"
                alt="RICH GIRL"
                className="h-14 lg:h-16 w-auto object-contain"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                Shop By Category
              </p>
              <Link
                to="/shop/indian"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-[var(--brand-mist-green)]"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}
              >
                <Flower2 className="w-4 h-4 text-emerald-600" /> Indian Wear
              </Link>
              <Link
                to="/shop/western"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-[var(--brand-mist-green)]"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}
              >
                <Shirt className="w-4 h-4 text-amber-600" /> Western Wear
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-[var(--brand-mist-green)]"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}
              >
                <LayoutGrid className="w-4 h-4 text-blue-600" /> All Collections
              </Link>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                  Account
                </p>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-[var(--brand-mist-green)]"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}
                >
                  <User className="w-4 h-4 text-gray-500" /> My Profile
                </Link>
                <Link
                  to="/profile/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-[var(--brand-mist-green)]"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}
                >
                  <Package className="w-4 h-4 text-gray-500" /> My Orders
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-[var(--brand-mist-green)]"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--brand-dark-text)' }}
                >
                  <ShoppingCart className="w-4 h-4 text-gray-500" /> My Cart
                  {cartCount > 0 && (
                    <span className="ml-auto bg-[var(--brand-cta-green)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}