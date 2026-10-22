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

/* Inline SVG rather than an icon font or a CDN library: nothing to install, nothing
   to fetch at runtime, and print.css can drop them for the ATS text stream.
   Each entry is a list of [tag, attributes] drawn on a 24x24 grid. */
const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONS = {
  location: [
    ['path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }],
    ['circle', { cx: '12', cy: '10', r: '3' }]
  ],
  email: [
    ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
    ['path', { d: 'm2 7 10 7 10-7' }]
  ],
  phone: [
    ['path', { d: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z' }]
  ],
  linkedin: [
    ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v1.5A6 6 0 0 1 16 8z' }],
    ['rect', { x: '2', y: '9', width: '4', height: '12' }],
    ['circle', { cx: '4', cy: '4', r: '2' }]
  ],
  // The GitHub mark is a filled glyph on a 16-grid, not a stroked 24 one.
  github: {
    viewBox: '0 0 16 16',
    filled: true,
    parts: [['path', { d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z' }]]
  },
  link: [
    ['path', { d: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7' }],
    ['path', { d: 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7' }]
  ]
};

function icon(name) {
  const entry = ICONS[name] || ICONS.link;
  const parts = Array.isArray(entry) ? entry : entry.parts;
  const viewBox = Array.isArray(entry) ? '0 0 24 24' : (entry.viewBox || '0 0 24 24');
  const filled = !Array.isArray(entry) && entry.filled;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'contact-icon');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');

  if (filled) {
    svg.setAttribute('fill', 'currentColor');
  } else {
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
  }

  parts.forEach((spec) => {
    const node = document.createElementNS(SVG_NS, spec[0]);
    Object.keys(spec[1]).forEach((key) => node.setAttribute(key, spec[1][key]));
    svg.appendChild(node);
  });

  return svg;
}

function contactItem(iconName, text, href) {
  const node = href ? el('a', 'contact-item') : el('span', 'contact-item');
  if (href) {
    node.href = href;
    if (!href.startsWith('mailto:') && !href.startsWith('tel:')) {
      node.rel = 'noopener';
      node.target = '_blank';
    }
  }
  node.appendChild(icon(iconName));
  node.appendChild(el('span', 'contact-text', text));
  return node;
}

function renderContact(contact) {
  const target = document.querySelector('.contact-items');
  target.textContent = '';

  if (contact.location) target.appendChild(contactItem('location', contact.location));
  if (contact.email) target.appendChild(contactItem('email', contact.email, 'mailto:' + contact.email));
  if (contact.phone) {
    target.appendChild(contactItem('phone', contact.phone, 'tel:' + contact.phone.replace(/[^+\d]/g, '')));
  }

  (contact.links || []).forEach((link) => {
    target.appendChild(contactItem(link.icon || 'link', link.label, link.url));
  });
}

function renderSocialLinks(contact) {
  const target = document.querySelector('.social-links');
  if (!target) return;  // not present in this layout
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
  if (!target) return;  // not present in this layout
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


/* ---------- Multiverse components (v7) ---------- */

function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.keys(attrs || {}).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

/* The portal: nested rings rotating at different speeds, a breathing core, and
   version labels. Drawn here so it inherits the theme tokens. */
function renderPortal() {
  const target = document.querySelector('.hero-portal');
  if (!target) return;
  target.textContent = '';

  const svg = svgEl('svg', { viewBox: '0 0 400 400', role: 'img', 'aria-label': 'Nested rings rotating around a core' });

  const defs = svgEl('defs', {});
  const grad = svgEl('radialGradient', { id: 'mv-core' });
  grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#ffffff' }));
  grad.appendChild(svgEl('stop', { offset: '0.35', 'stop-color': 'var(--accent)' }));
  grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--accent)', 'stop-opacity': '0' }));
  defs.appendChild(grad);
  svg.appendChild(defs);

  const dotted = svgEl('circle', {
    cx: '200', cy: '200', r: '190', fill: 'none', stroke: 'var(--accent)',
    'stroke-opacity': '0.35', 'stroke-dasharray': '2 10', class: 'ring-dotted'
  });
  svg.appendChild(dotted);

  const rings = [
    { shape: 'rect', attrs: { x: '70', y: '70', width: '260', height: '260', fill: 'none', stroke: 'var(--pink)', 'stroke-width': '2', 'stroke-opacity': '0.8' }, cls: 'ring-a' },
    { shape: 'rect', attrs: { x: '70', y: '70', width: '260', height: '260', fill: 'none', stroke: 'var(--accent)', 'stroke-width': '2', transform: 'rotate(45 200 200)' }, cls: 'ring-b' },
    { shape: 'polygon', attrs: { points: '200,90 295,145 295,255 200,310 105,255 105,145', fill: 'none', stroke: 'var(--muted)', 'stroke-width': '1.5' }, cls: 'ring-c' },
    { shape: 'polygon', attrs: { points: '200,125 265,238 135,238', fill: 'none', stroke: 'var(--pink)', 'stroke-width': '2' }, cls: 'ring-d' }
  ];
  rings.forEach((ring) => {
    const g = svgEl('g', { class: 'ring ' + ring.cls });
    g.appendChild(svgEl(ring.shape, ring.attrs));
    svg.appendChild(g);
  });

  svg.appendChild(svgEl('circle', { cx: '200', cy: '200', r: '70', fill: 'url(#mv-core)', class: 'core' }));

  const labels = [['v0', 200, 20, 'middle'], ['v1', 385, 204, 'end'], ['v2', 200, 392, 'middle'], ['v3', 15, 204, 'start']];
  const group = svgEl('g', { class: 'ring-labels' });
  labels.forEach((label) => {
    const text = svgEl('text', { x: String(label[1]), y: String(label[2]), 'text-anchor': label[3] });
    text.textContent = label[0];
    group.appendChild(text);
  });
  svg.appendChild(group);

  target.appendChild(svg);
}

/* 01 - Variants. Chips switch the panel below, the way the ETL/ELT toggle does. */
function renderPatternPanel(data, id) {
  const panel = document.querySelector('.pattern-panel');
  if (!panel) return;
  const pattern = (data.patterns || []).filter((p) => p.id === id)[0];
  if (!pattern) return;

  panel.textContent = '';
  panel.appendChild(el('h3', 'pattern-headline', pattern.headline));
  panel.appendChild(el('p', 'pattern-detail', pattern.detail));

  const where = el('div', 'pattern-where');
  where.appendChild(el('span', 'pattern-where-label', 'used on'));
  const list = el('ul', 'chips');
  (pattern.where || []).forEach((name) => list.appendChild(el('li', null, name)));
  where.appendChild(list);
  panel.appendChild(where);

  document.querySelectorAll('.chip').forEach((chip) => {
    const on = chip.getAttribute('data-pattern') === id;
    chip.classList[on ? 'add' : 'remove']('is-on');
    chip.setAttribute('aria-selected', String(on));
  });
}

function renderPatterns(data) {
  const row = document.querySelector('.chips-row');
  if (!row || !data.patterns) return;
  row.textContent = '';

  data.patterns.forEach((pattern) => {
    const chip = el('button', 'chip', pattern.label);
    chip.type = 'button';
    chip.setAttribute('role', 'tab');
    chip.setAttribute('data-pattern', pattern.id);
    chip.addEventListener('click', () => renderPatternPanel(data, pattern.id));
    row.appendChild(chip);
  });

  renderPatternPanel(data, data.patterns[0].id);
}

/* 02 - Replay, reframed from the reference's table time travel. */
function renderReplay(replay) {
  const target = document.querySelector('.replay-points');
  if (!target || !replay) return;

  const headline = document.querySelector('.replay-headline');
  if (headline) headline.textContent = replay.headline;
  const detail = document.querySelector('.replay-detail');
  if (detail) detail.textContent = replay.detail;

  target.textContent = '';
  (replay.points || []).forEach((point, index) => {
    const row = el('div', 'replay-point');
    row.appendChild(el('span', 'replay-version', 'v' + index));
    const body = el('div');
    body.appendChild(el('p', 'replay-key', point.k));
    body.appendChild(el('p', 'replay-value', point.v));
    row.appendChild(body);
    target.appendChild(row);
  });
}

/* 03 - Nexus events: named facts, deliberately not figures. */
function renderFacts(facts) {
  const target = document.querySelector('.fact-cards');
  if (!target) return;
  target.textContent = '';
  (facts || []).forEach((fact) => {
    const card = el('div', 'fact-card');
    card.appendChild(el('span', 'fact-value', fact.v));
    card.appendChild(el('span', 'fact-label', fact.l));
    target.appendChild(card);
  });
}

function renderCta(data) {
  if (!data.cta) return;
  const headline = document.querySelector('.cta-headline');
  const copy = document.querySelector('.cta-copy');
  if (headline) headline.textContent = data.cta.headline;
  if (copy) copy.textContent = data.cta.copy;
}

function renderProfile(data) {
  document.querySelector('.profile-name').textContent = data.name;
  document.querySelector('.profile-role').textContent = data.role;
  // The headline carries one accented phrase, named explicitly in data.js so the
  // renderer never has to guess where to split it.
  const taglineNode = document.querySelector('.hero-tagline');
  if (taglineNode) {
    taglineNode.textContent = '';
    const full = data.tagline || '';
    const phrase = data.taglineAccent;
    const at = phrase ? full.indexOf(phrase) : -1;
    if (at === -1) {
      taglineNode.textContent = full;
    } else {
      taglineNode.appendChild(document.createTextNode(full.slice(0, at)));
      taglineNode.appendChild(el('span', 'accent', phrase));
      taglineNode.appendChild(document.createTextNode(full.slice(at + phrase.length)));
    }
  }
  document.querySelector('.profile-summary').textContent = data.summary;
  document.querySelector('.profile-summary-ats').textContent = atsSummary(data);
  document.querySelector('.nav-initials').textContent = data.name;
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
  renderPortal();
  renderPatterns(data);
  renderReplay(data.replay);
  renderFacts(data.facts);
  renderCta(data);
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
