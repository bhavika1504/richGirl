import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { CategoryScroll } from './CategoryScroll';
import { ProductGrid } from './ProductGrid';
import { IndianWearBanner } from './IndianWearBanner';
import { Testimonials } from './Testimonials';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

export function Home() {
  return (
    <div className="min-h-screen bg-white pb-16 lg:pb-0">
      <Navbar />
      <main>
        <Hero />
        <CategoryScroll />
        <ProductGrid />
        <IndianWearBanner />
        <Testimonials />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
