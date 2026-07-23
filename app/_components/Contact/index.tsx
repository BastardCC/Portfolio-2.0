import textContactMark from "./assets/text-contact.svg";
import { CONTACT } from "./contact-data";
import "./contact.css";

const ExternalArrowIcon = () => (
  <svg
    className="contact__social-icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M7 17L17 7M17 7H9M17 7V15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Contact = () => {
  return (
    <div className="container contact__inner">
      <div className="contact__top">
        <div className="contact__grid">
          <div className="contact__intro">
            <div className="contact__intro-main">
              <p className="contact__eyebrow">{CONTACT.eyebrow}</p>
              <h2 className="contact__title">
                {CONTACT.titleLines.map((line) => (
                  <span key={line} className="contact__title-line">
                    {line}
                  </span>
                ))}
              </h2>
              <p className="contact__copyright">{CONTACT.copyright}</p>
            </div>
          </div>

          <div className="contact__details">
            <div className="contact__detail">
              <p className="contact__detail-label">{CONTACT.email.label}</p>
              <a className="contact__detail-value" href={CONTACT.email.href}>
                {CONTACT.email.value}
              </a>
            </div>
            <div className="contact__detail">
              <p className="contact__detail-label">{CONTACT.phone.label}</p>
              <a className="contact__detail-value" href={CONTACT.phone.href}>
                {CONTACT.phone.value}
              </a>
            </div>
          </div>

          <nav className="contact__socials" aria-label="Réseaux sociaux">
            {CONTACT.socials.map((social) => (
              <a
                key={social.label}
                className="contact__social"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{social.label}</span>
                <ExternalArrowIcon />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="contact__bottom">
        <p className="contact__statement">
          <img
            className="contact__statement-mark"
            src={
              typeof textContactMark === "string"
                ? textContactMark
                : textContactMark.src
            }
            alt={CONTACT.statement}
            width={1490}
            height={186}
            decoding="async"
          />
        </p>
      </div>
    </div>
  );
};

export default Contact;
