import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Projects from "./_components/Projects";

export default function Home() {
  return (
    <div>
      <Header />
      <section className="relative z-0">
        <Hero />
      </section>
      <section className="relative z-0 my-30">
        <Projects />
      </section>
    </div>
  );
}
