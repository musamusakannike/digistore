import Hero from "./components/Hero";
import Collections from "./components/Collections";
import ShopByCategory from "./components/Categories";
import FeaturedProducts from "./components/FeaturedProducts";
import Testimonials from "./components/Testimonials";
import StatsMarquee from "./components/StatsMarquee";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* Hero Section */}
      <Hero />

      {/* Featured Collections */}
      <Collections />

      {/* Shop by Category */}
      <ShopByCategory />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Testimonials */}
      <Testimonials />

      {/* Stats & Brands Marquee */}
      <StatsMarquee />

      {/* Footer */}
      <Footer />
    </main>
  );
}