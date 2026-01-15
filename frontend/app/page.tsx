import Hero from "./components/Hero";
import ShopByCategory from "./components/Categories";
import Collections from "./components/Collections";
import FeaturedProducts from "./components/FeaturedProducts";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50">
      <Hero />
      <Collections />
      <ShopByCategory />
      <FeaturedProducts />
    </main>
  );
}