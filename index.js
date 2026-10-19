/* Renders profileData (data.js) into the page, drives the nav, and builds the DOCX.
   PDF download is the browser's own print-to-PDF against print.css. */

const THEME_KEY = 'portfolio-theme';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function chipList(items) {
  const ul = el('ul', 'chips');
  items.forEach((item) => ul.appendChild(el('li', null, item)));
  return ul;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').toUpperCase();
}

function contactLine(contact) {
  const parts = [contact.location, contact.email, contact.phone].filter(Boolean);
  const links = (contact.links || []).map((link) => link.url);
  return parts.concat(links).join(' | ');
}

// The PDF and DOCX use the keyword-dense summary; the page uses the readable one.
// Falls back to `summary` when `summaryAts` is not set.
function atsSummary(data) {
  return data.summaryAts || data.summary;
}

function renderContact(contact) {
  const target = document.querySelector('.contact-items');
  target.textContent = '';

  if (contact.location) target.appendChild(el('span', null, contact.location));
  if (contact.email) {
    const a = el('a', null, contact.email);
    a.href = 'mailto:' + contact.email;
    target.appendChild(a);
  }
  if (contact.phone) target.appendChild(el('span', null, contact.phone));

  (contact.links || []).forEach((link) => {
    const a = el('a', null, link.label);
    a.href = link.url;
    a.rel = 'noopener';
    a.target = '_blank';
    target.appendChild(a);
  });
}

function renderSocialLinks(contact) {
  const target = document.querySelector('.social-links');
  target.textContent = '';

  const entries = [];
  if (contact.email) entries.push({ label: 'Email', url: 'mailto:' + contact.email });
  (contact.links || []).forEach((link) => entries.push({ label: link.label, url: link.url }));

  entries.forEach((entry) => {
    const a = el('a', null, entry.label);
    a.href = entry.url;
    if (!entry.url.startsWith('mailto:')) {
      a.rel = 'noopener';
      a.target = '_blank';
    }
    target.appendChild(a);
  });
}

function renderHighlights(highlights) {
  const target = document.querySelector('.highlights');
  target.textContent = '';
  (highlights || []).forEach((item) => {
    const li = el('li');
    li.appendChild(el('span', 'highlight-value', item.value));
    li.appendChild(el('span', 'highlight-label', item.label));
    target.appendChild(li);
  });
}

function renderSkills(skills) {
  const target = document.querySelector('.key-skills');
  target.textContent = '';
  skills.forEach((group) => {
    const wrap = el('div', 'skill-group');
    wrap.appendChild(el('h3', null, group.category));
    wrap.appendChild(chipList(group.items));
    target.appendChild(wrap);
  });
}

// Projects carry an `employer` naming the role they were delivered under, so each
// role renders with its own work nested beneath it. A project whose employer matches
// no role would silently vanish, so those are collected and appended under the last
// role rather than lost.
function projectsFor(data, company) {
  return (data.projects || []).filter((project) => project.employer === company);
}

function unmatchedProjects(data) {
  const companies = (data.experiences || []).map((job) => job.company);
  return (data.projects || []).filter((project) => !companies.includes(project.employer));
}

function renderExperiences(data) {
  const target = document.querySelector('.all-experiences');
  target.textContent = '';

  const roles = data.experiences || [];
  const orphans = unmatchedProjects(data);

  roles.forEach((job, index) => {
    const wrap = el('section', 'role');

    const head = el('div', 'role-head');
    const heading = el('div');
    heading.appendChild(el('h3', 'entry-title', job.title));
    heading.appendChild(el('p', 'entry-sub', job.company));
    head.appendChild(heading);

    const meta = el('div', 'role-meta');
    meta.appendChild(el('p', 'entry-meta', job.duration));
    if (job.location) meta.appendChild(el('p', 'entry-meta', job.location));
    head.appendChild(meta);
    wrap.appendChild(head);

    if (job.summary && job.summary.length) {
      const ul = el('ul', 'role-summary');
      job.summary.forEach((line) => ul.appendChild(el('li', null, line)));
      wrap.appendChild(ul);
    }

    let projects = projectsFor(data, job.company);
    if (index === roles.length - 1) projects = projects.concat(orphans);

    if (projects.length) {
      const list = el('div', 'role-projects');
      projects.forEach((project) => list.appendChild(projectCard(project)));
      wrap.appendChild(list);
    }

    target.appendChild(wrap);
  });
}

function renderEducation(education) {
  const target = document.querySelector('.all-education');
  target.textContent = '';
  education.forEach((item) => {
    const wrap = el('div', 'education-entry');
    wrap.appendChild(el('p', 'entry-title', item.degree));
    wrap.appendChild(el('p', 'entry-sub', item.institute));
    wrap.appendChild(el('p', 'entry-meta', [item.duration, item.note].filter(Boolean).join(' | ')));
    target.appendChild(wrap);
  });
}

// Hidden entirely until data.js has entries, so the page never shows an empty shell.
function renderCertifications(certifications) {
  const target = document.querySelector('.all-certifications');
  const section = document.querySelector('.section-certifications');
  target.textContent = '';
  const items = certifications || [];
  section.hidden = items.length === 0;
  items.forEach((item) => {
    const wrap = el('div', 'certification-entry');
    wrap.appendChild(el('p', 'entry-title', item.name));
    wrap.appendChild(el('p', 'entry-sub', item.issuer));
    if (item.year) wrap.appendChild(el('p', 'entry-meta', item.year));
    target.appendChild(wrap);
  });
}

function projectCard(project) {
  const wrap = el('article', 'project');

  const head = el('div', 'project-head');
  head.appendChild(el('h3', 'project-name', project.name));
  if (project.duration) head.appendChild(el('span', 'project-duration', project.duration));
  wrap.appendChild(head);

  if (project.client || project.role) {
    const meta = el('p', 'project-meta');
    if (project.client) meta.appendChild(el('strong', null, project.client));
    if (project.client && project.role) meta.appendChild(document.createTextNode(' | '));
    if (project.role) meta.appendChild(document.createTextNode(project.role));
    wrap.appendChild(meta);
  }

  if (project.url) {
    const line = el('p', 'project-link');
    const a = el('a', null, project.url.replace(/^https?:\/\//, ''));
    a.href = project.url;
    a.rel = 'noopener';
    a.target = '_blank';
    line.appendChild(a);
    wrap.appendChild(line);
  }

  const ul = el('ul');
  (project.bullets || []).forEach((bullet) => ul.appendChild(el('li', null, bullet)));
  wrap.appendChild(ul);

  if (project.tech && project.tech.length) wrap.appendChild(chipList(project.tech));
  return wrap;
}

function renderPersonalProjects(projects) {
  const target = document.querySelector('.all-personal-projects');
  const section = document.querySelector('.section-personal');
  target.textContent = '';
  const items = projects || [];
  section.hidden = items.length === 0;
  items.forEach((project) => target.appendChild(projectCard(project)));
}

function renderAtsPreHeader(data) {
  const target = document.querySelector('.ats-pre-header');
  target.textContent = '';
  target.appendChild(el('span', 'ats-name', data.name));
  target.appendChild(el('span', 'ats-role', data.role));
  target.appendChild(el('span', 'ats-contact', contactLine(data.contact)));
}

function renderProfile(data) {
  document.querySelector('.profile-name').textContent = data.name;
  document.querySelector('.profile-role').textContent = data.role;
  document.querySelector('.hero-tagline').textContent = data.tagline || '';
  document.querySelector('.profile-summary').textContent = data.summary;
  document.querySelector('.profile-summary-ats').textContent = atsSummary(data);
  document.querySelector('.nav-initials').textContent = initials(data.name);
  document.querySelector('.footer-name').textContent = data.name;
  document.title = data.name + ' | ' + data.role;

  renderContact(data.contact);
  renderSocialLinks(data.contact);
  renderHighlights(data.highlights);
  renderSkills(data.skills);
  renderExperiences(data);
  renderEducation(data.education);
  renderCertifications(data.certifications);
  renderPersonalProjects(data.personalProjects);
  renderAtsPreHeader(data);
}

/* ---------- DOCX ---------- */

function docxParagraph(text, paragraphOptions, runOptions) {
  const { Paragraph, TextRun } = window.docx;
  return new Paragraph(
    Object.assign({ children: [new TextRun(Object.assign({ text: text }, runOptions || {}))] }, paragraphOptions || {})
  );
}

function docxHeading(text) {
  const { BorderStyle } = window.docx;
  // Deliberately not using HeadingLevel: Word's built-in heading styles would
  // override the font and colour set here. A bold run with a bottom rule is predictable.
  return docxParagraph(
    text.toUpperCase(),
    {
      spacing: { before: 240, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 2, color: '000000' } }
    },
    { bold: true, size: 22 }
  );
}

function docxBullet(text) {
  return docxParagraph(text, { bullet: { level: 0 }, spacing: { after: 40 } }, { size: 20 });
}

function docxProject(children, project) {
  children.push(docxParagraph('Project: ' + project.name + (project.duration ? ' | ' + project.duration : ''), { spacing: { before: 120 } }, { bold: true, size: 20 }));
  if (project.client || project.role) {
    children.push(docxParagraph([project.client && 'Client: ' + project.client, project.role].filter(Boolean).join(' | '), { spacing: { after: 20 } }, { size: 19 }));
  }
  if (project.tech && project.tech.length) {
    children.push(docxParagraph(project.tech.join(', '), { spacing: { after: 60 } }, { size: 19, italics: true }));
  }
  (project.bullets || []).forEach((bullet) => children.push(docxBullet(bullet)));
}

function buildResumeDocx(data) {
  const { Document, Packer } = window.docx;
  const children = [];

  children.push(docxParagraph(data.name, { spacing: { after: 20 } }, { bold: true, size: 36 }));
  children.push(docxParagraph(data.role, { spacing: { after: 20 } }, { bold: true, size: 22 }));
  children.push(docxParagraph(contactLine(data.contact), { spacing: { after: 160 } }, { size: 19 }));

  children.push(docxHeading('Summary'));
  children.push(docxParagraph(atsSummary(data), { spacing: { after: 80 } }, { size: 20 }));

  children.push(docxHeading('Key Skills'));
  data.skills.forEach((group) => {
    children.push(docxParagraph(group.category + ': ' + group.items.join(', '), { spacing: { after: 40 } }, { size: 20 }));
  });

  children.push(docxHeading('Work Experience'));
  const roles = data.experiences || [];
  const orphans = unmatchedProjects(data);
  roles.forEach((job, index) => {
    children.push(docxParagraph(job.title + ' - ' + job.company, { spacing: { before: 160 } }, { bold: true, size: 22 }));
    children.push(docxParagraph([job.duration, job.location].filter(Boolean).join(' | '), { spacing: { after: 60 } }, { size: 19 }));
    (job.summary || []).forEach((line) => children.push(docxBullet(line)));

    let projects = projectsFor(data, job.company);
    if (index === roles.length - 1) projects = projects.concat(orphans);
    projects.forEach((project) => docxProject(children, project));
  });

  if (data.personalProjects && data.personalProjects.length) {
    children.push(docxHeading('Personal Projects'));
    data.personalProjects.forEach((project) => docxProject(children, project));
  }

  children.push(docxHeading('Education'));
  data.education.forEach((item) => {
    children.push(docxParagraph(item.degree, { spacing: { before: 80 } }, { bold: true, size: 21 }));
    children.push(docxParagraph([item.institute, item.duration, item.note].filter(Boolean).join(' | '), { spacing: { after: 40 } }, { size: 19 }));
  });

  if (data.certifications && data.certifications.length) {
    children.push(docxHeading('Certifications'));
    data.certifications.forEach((item) => {
      children.push(docxParagraph([item.name, item.issuer, item.year].filter(Boolean).join(' | '), { spacing: { after: 40 } }, { size: 20 }));
    });
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 20 }, paragraph: { spacing: { line: 276 } } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: children }]
  });

  return Packer.toBlob(doc);
}

function resumeFilename(extension) {
  const slug = profileData.name.replace(/\s+/g, '-');
  const date = new Date().toISOString().slice(0, 10);
  return slug + '-Resume-' + date + '.' + extension;
}

function downloadResumeDocx() {
  if (!window.docx) {
    window.alert('The DOCX library did not load. Check your network connection and try again.');
    return;
  }
  buildResumeDocx(profileData)
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resumeFilename('docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error('DOCX generation failed', error);
      window.alert('Could not generate the DOCX file.');
    });
}

/* ---------- theme ---------- */

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const label = document.querySelector('.theme-toggle-label');
  if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    /* storage unavailable: the toggle still works for this page view */
  }
}

function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (error) {
    stored = null;
  }
  applyTheme(stored || 'dark');
}

/* ---------- nav and scroll ---------- */

function initNav() {
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  if (!('IntersectionObserver' in window)) return;

  const links = new Map();
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (section) links.set(section, link);
  });

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.classList.remove('is-active'));
      const active = links.get(entry.target);
      if (active) active.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  links.forEach((_link, section) => spy.observe(section));
}

function initReveal() {
  const targets = document.querySelectorAll('.reveal, .project, .skill-group, .experience-entry, .education-entry, .certification-entry');

  if (!('IntersectionObserver' in window)) {
    targets.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  targets.forEach((node) => observer.observe(node));
}

/* ---------- boot ---------- */

function init() {
  renderProfile(profileData);
  initTheme();
  initNav();
  initReveal();

  document.querySelectorAll('.docx-download').forEach((button) => button.addEventListener('click', downloadResumeDocx));
  document.querySelectorAll('.pdf-download').forEach((button) => button.addEventListener('click', () => window.print()));
  document.querySelector('.theme-toggle').addEventListener('click', () => {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  const printTitle = resumeFilename('pdf').replace(/\.pdf$/, '');
  let originalTitle = document.title;
  window.addEventListener('beforeprint', () => {
    originalTitle = document.title;
    document.title = printTitle;
  });
  window.addEventListener('afterprint', () => {
    document.title = originalTitle;
  });
}

window.addEventListener('DOMContentLoaded', init);
