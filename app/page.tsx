import Header from "./_components/Header";
import Hero from "./_components/Hero";
import { CurtainDemo } from "./_components/CurtainDemo";
import Projects from "./_components/Projects";
import Awards from "./_components/Awards";

export default function Home() {
  return (
    <div>
      <Header />
      <section className="relative z-0">
        <Hero />
      </section>
      <CurtainDemo />
      <section className="relative z-10 my-30 bg-background">
        <Projects />
      </section>
      <section className="relative z-0 my-30">
        <Awards />
      </section>
    </div>
  );
}
