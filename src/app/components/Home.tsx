import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { CategoryScroll } from './CategoryScroll';
import { ProductGrid } from './ProductGrid';
import { AboutUs } from './AboutUs';
import { Footer } from './Footer';

export function Home() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Navbar />
      <main>
        <Hero />
        <CategoryScroll />
        <ProductGrid />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
}
