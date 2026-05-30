import { ShoppingCart, User, Menu, Search } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const cartItems = await api.getCart();
        const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
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
    <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: '0.5px solid var(--brand-border)' }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2 -ml-2">
          <Menu className="w-6 h-6" style={{ color: "var(--brand-dark-text)" }} />
        </button>

        {/* Left Nav Links - Desktop Only */}
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/shop" className="relative group px-4 py-2 rounded-full transition-all" style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--brand-dark-text)",
            backgroundColor: "var(--brand-mist-green)"
          }}>
            Indian Wear
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--brand-cta-green)] transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
          {/* Additional category links can be added here */}
          <Link to="/track" className="relative group px-4 py-2 rounded-full transition-all hover:bg-emerald-50" style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--brand-dark-text)",
            backgroundColor: "var(--brand-mist-green)"
          }}>
            Track Courier
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--brand-cta-green)] transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
        </div>

        {/* Center Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="tracking-[0.1em]" style={{
            fontFamily: "var(--font-headline)",
            color: "var(--brand-dark-text)",
            fontWeight: "800",
            fontSize: "clamp(18px, 5vw, 40px)"
          }}>
            RICH GIRL
          </h1>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 hidden lg:block hover:bg-[#F8F9F8] rounded-full transition-colors">
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
          <button onClick={handleUserClick} className="p-2">
            <User className="w-5 h-5" style={{ color: "var(--brand-dark-text)" }} />
          </button>
        </div>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthPromptModal isOpen={isAuthPromptOpen} onClose={() => setIsAuthPromptOpen(false)} />
    </nav>
  );
}