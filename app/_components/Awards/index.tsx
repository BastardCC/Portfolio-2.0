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
];

const Awards = () => {
  return (
    <section className="awards bg-foreground text-white">
      <AwardsScroll
        awards={awards}
        description="Texte de description des récompenses et distinctions obtenues au fil des projets."
      />
    </section>
  );
};

export default Awards;
