import Image from "next/image";
import RevealText from "../RevealText";
import bigCircle from "./assets/big-circle.png";
import smallCircle from "./assets/small-circle.png";
import "./hero.css";

const heroTitleClassName = "hero__title";

const heroBodyClassName =
  "hero__content container relative z-10 mt-[clamp(2rem,8vw,5rem)] text-[clamp(1.25rem,2.5vw+0.75rem,3.75rem)] leading-snug";

const heroBodyLines = [
  "Lorem ipsum, dolor sit amet consectetur",
  "adipisicing elit. Veniam vero ipsum unde ratione.",
  "Reprehenderit mollitia excepturi illum vero iure et dolore",
  "sit placeat aliquid sint corrupti sapiente, rerum vel aut",
  "dignissimos fuga officia error labore!",
];

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__main">
        <div className="hero-circles" aria-hidden>
          <div className="hero-circle hero-circle--small">
            <Image
              src={smallCircle}
              alt=""
              className="hero-circle__asset hero-circle__asset--small"
              priority
            />
          </div>
          <div className="hero-circle hero-circle--big">
            <Image
              src={bigCircle}
              alt=""
              className="hero-circle__asset hero-circle__asset--big"
              priority
            />
          </div>
        </div>

        <div className="hero__content container">
          <div className="flex flex-col gap-4 py-2 md:flex-row md:items-end md:justify-between md:gap-0">
            <RevealText
              direction="rise"
              delay={0.65}
              className="hero__title-reveal"
            >
              <h1 className={heroTitleClassName}>Engineer</h1>
            </RevealText>
            <RevealText
              direction="rise"
              delay={0.95}
              className="w-full md:max-w-[30%]"
            >
              <p className="text-xs uppercase md:text-right">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam
                vero ipsum unde ratione.
              </p>
            </RevealText>
          </div>

          <div className="hero-line h-px w-full bg-foreground" aria-hidden />

          <div className="flex flex-col gap-4 py-2 md:flex-row md:items-start md:justify-between md:gap-0">
            <RevealText
              direction="descend"
              delay={0.95}
              className="w-full md:max-w-[15%]"
            >
              <p className="text-xs uppercase">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam
                vero ipsum.
              </p>
            </RevealText>
            <RevealText
              direction="descend"
              delay={0.65}
              className="hero__title-reveal"
            >
              <h1 className={`${heroTitleClassName} md:text-right`}>
                Fullstack Developer
              </h1>
            </RevealText>
          </div>
        </div>
      </div>

      <div className={heroBodyClassName}>
        <RevealText
          lines={heroBodyLines}
          direction="rise"
          delay={1.15}
          duration={1.2}
          staggerDelay={0.18}
        />
      </div>
    </section>
  );
};

export default Hero;
