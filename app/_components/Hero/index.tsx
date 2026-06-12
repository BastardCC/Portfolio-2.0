import "./hero.css";

const heroTitleClassName =
  "hero-delay-title text-[clamp(4rem,7vw+1rem,7rem)] leading-none md:leading-normal";

const Hero = () => {
  return (
    <div className="container">
      <div className="flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between md:gap-0">
        <div className="hero-reveal-rise">
          <h1 className={heroTitleClassName}>Engineer</h1>
        </div>
        <div className="hero-reveal-rise w-full md:max-w-[30%]">
          <p className="hero-delay-copy text-xs uppercase md:text-right">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam vero
            ipsum unde ratione.
          </p>
        </div>
      </div>

      <div className="hero-line h-px w-full bg-foreground" aria-hidden />

      <div className="flex flex-col gap-4 py-8 md:flex-row md:items-start md:justify-between md:gap-0">
        <div className="hero-reveal-descend w-full md:max-w-[15%]">
          <p className="hero-delay-copy text-xs uppercase">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam vero
            ipsum.
          </p>
        </div>
        <div className="hero-reveal-descend">
          <h1 className={`${heroTitleClassName} md:text-right`}>
            Fullstack Developer
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Hero;
