import type { MaintenanceSettings } from "@/lib/maintenance";
import "./maintenance-screen.css";

type Props = {
  settings: MaintenanceSettings;
  preview?: boolean;
};

export function MaintenanceScreen({ settings, preview = false }: Props) {
  const email = settings.contact_email.trim();
  const showContact = email.length > 0;

  return (
    <section
      className={preview ? "cr-maint cr-maint--preview" : "cr-maint"}
      aria-label="Website maintenance"
    >
      <div className="cr-maint__panel">
        <img
          src="/img/logo_bg.webp"
          alt="Caritas Rwanda"
          className="cr-maint__logo"
        />
        <p className="cr-maint__eyebrow">
          <span className="cr-maint__dot" aria-hidden="true" />
          {settings.eyebrow}
        </p>
        <hr className="cr-maint__rule" />
        <h1 className="cr-maint__title">{settings.title}</h1>
        <p className="cr-maint__message">{settings.message}</p>
        {showContact ? (
          <div className="cr-maint__contact">
            {settings.contact_label ? (
              <p className="cr-maint__contact-label">{settings.contact_label}</p>
            ) : null}
            <a className="cr-maint__contact-link" href={`mailto:${encodeURI(email)}`}>
              {email}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
