import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Projects from "./_components/Projects";
import Services from "./_components/Services";
import { TransitionProvider } from "./_components/ProjectsAwardsTransition";

export default function Home() {
  return (
    <TransitionProvider>
      <div>
        <Header />
        <section className="relative z-0">
          <Hero />
        </section>
        <section className="relative z-10 mt-30">
          <Projects />
        </section>
        <section className="relative z-10 bg-[#0a0909] text-background">
          <Services />
        </section>
      </div>
    </TransitionProvider>
  );
}
