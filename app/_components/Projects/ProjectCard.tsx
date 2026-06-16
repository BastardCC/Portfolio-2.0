import Image, { type StaticImageData } from "next/image";
import "./project-card.css";

type ProjectCardProps = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: StaticImageData;
};

const ProjectCard = ({
  title,
  description,
  category,
  tags,
  image,
}: ProjectCardProps) => {
  return (
    <article className="project-card" tabIndex={0}>
      <span className="project-card__curtain" aria-hidden />
      <header className="project-card__header">
        <div className="project-card__text-reveal">
          <h3 className="text-4xl">{title}</h3>
        </div>
        <div className="project-card__text-reveal project-card__text-reveal--delay">
          <p>{description}</p>
        </div>
      </header>

      <div className="project-card__media">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="project-card__image"
        />
        <div className="project-card__media-caption">
          <div className="project-card__text-reveal project-card__text-reveal--in">
            <h3 className="text-4xl">{title}</h3>
          </div>
        </div>
      </div>

      <footer className="project-card__footer">
        <p className="text-[12px] font-semibold uppercase">{category}</p>
        <div className="project-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="project-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
};

export default ProjectCard;
