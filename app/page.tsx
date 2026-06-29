import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Projects from "./_components/Projects";
import Awards from "./_components/Awards";

export default function Home() {
  return (
    <div>
      <Header />
      <section className="relative z-0">
        <Hero />
      </section>
      <section className="relative z-10 my-30 bg-background">
        <Projects />
      </section>
      <section className="relative z-0 my-30">
        <Awards />
      </section>
    </div>
  );
}
