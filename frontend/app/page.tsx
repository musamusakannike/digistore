import Hero from "./components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50">
      <Hero />
      <div className="flex min-h-screen flex-col items-center p-24 text-center">
        <h2 className="text-2xl font-semibold mb-6">Featured Products</h2>
        <p className="text-gray-600">Scroll down for more content...</p>
      </div>
    </main>
  );
}