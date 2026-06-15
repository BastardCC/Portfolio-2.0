import Header from "./_components/Header";
import Hero from "./_components/Hero";

export default function Home() {
  return (
    <div>
      <Header />
      <section className="relative z-0">
        <Hero />
      </section>
    </div>
  );
}
