import ContactSocialLink from "./ContactSocialLink";
import ContactStatement from "./ContactStatement";
import { CONTACT } from "./contact-data";
import "./contact.css";

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
              <ContactSocialLink
                key={social.label}
                label={social.label}
                hoverLabel={social.hoverLabel}
                hoverIcon={social.hoverIcon}
                href={social.href}
                curtainColor={social.curtainColor}
              />
            ))}
          </nav>
        </div>
      </div>

      <ContactStatement />
    </div>
  );
};

export default Contact;
