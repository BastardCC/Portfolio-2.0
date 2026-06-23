import RevealText from "../RevealText";
import BigCircle from "../Hero/assets/big-circle.png";
import SmallCircle from "../Hero/assets/small-circle.png";
import Doonation from "../Projects/assets/doonation.png";
import AwardsScroll from "./AwardsScroll";
import "./awards.css";

const awards = [
  {
    title: "Award 1",
    description: "Award Description",
    image: Doonation,
  },
  {
    title: "Award 2",
    description: "Award Description",
    image: BigCircle,
  },
  {
    title: "Award 3",
    description: "Award Description",
    image: SmallCircle,
  },
  {
    title: "Award 4",
    description: "Award Description",
    image: Doonation,
  },
  {
    title: "Award 5",
    description: "Award Description",
    image: BigCircle,
  },
];

const Awards = () => {
  return (
    <section className="awards bg-foreground text-white">
      <div className="container py-16 md:py-24">
        <div className="mb-12 md:mb-16">
          <h2 className="text-[clamp(4rem,7vw+1rem,7rem)]">Awards</h2>
          <RevealText direction="rise" delay={0}>
            <p className="text-[clamp(1.25rem,2.5vw+0.75rem,3.75rem)]">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos.
            </p>
          </RevealText>
        </div>
      </div>

      <AwardsScroll awards={awards} />
    </section>
  );
};

export default Awards;
