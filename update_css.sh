#!/bin/bash
sed -i '728,$d' src/app/\(website\)/programs/programs-page.css
cat << 'CSS_EOF' >> src/app/\(website\)/programs/programs-page.css
/* List layout for Programs based on PDF draft */
.prog-pdf-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 3rem 2rem;
}

.prog-pdf-card {
  display: flex;
  flex-direction: column;
}

.prog-pdf-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.prog-pdf-img {
  width: 140px;
  height: 95px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.prog-pdf-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prog-pdf-titles {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prog-pdf-title {
  font-size: 1.35rem;
  font-weight: 900;
  color: #a5280d;
  line-height: 1.2;
}

.prog-pdf-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6; /* Blue as seen in PDF */
}

.prog-pdf-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1.25rem;
}

.prog-pdf-footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 8px;
  overflow: hidden;
  margin-top: auto;
}

.prog-pdf-box {
  background: #e6dfd6;
  padding: 1rem 0.75rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.prog-pdf-icon {
  color: #fff;
  font-size: 1.4rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 0.2rem;
}

.prog-pdf-phone {
  color: #a5280d;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.03em;
}

.prog-pdf-box-text {
  font-size: 0.75rem;
  color: #374151;
  line-height: 1.4;
}

.prog-pdf-link-wrap a {
  color: #374151;
  text-decoration: none;
  display: block;
}

.prog-pdf-link-wrap a:hover {
  text-decoration: underline;
  color: #a5280d;
}

@media (max-width: 760px) {
  .prog-pdf-container {
    grid-template-columns: 1fr;
  }
}
CSS_EOF
bash update_css.sh
rm update_css.sh
