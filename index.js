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

// The wordmark follows the reference's `[name].data` form, so it wants the given
// name in lower case rather than initials.
function wordmark(name) {
  return name.split(/\s+/).filter(Boolean)[0].toLowerCase();
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
  if (!target) return;  // the hero drops these; the contact section still carries them
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
  if (!target) return;  // the v3 hero drops the stat tiles
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

  // Every data project in one grid, ahead of the roles. They are the work being
  // applied for, so they read better together than scattered across employers.
  const allCases = (data.projects || []).filter((project) => project.caseStudy);
  if (allCases.length) {
    const block = el('section', 'case-block');
    block.appendChild(el('span', 'print-title', 'Data Projects'));
    block.appendChild(el('p', 'case-block-label', 'Data projects'));
    const grid = el('div', 'case-grid');
    allCases.forEach((project) => grid.appendChild(projectCard(project)));
    block.appendChild(grid);
    target.appendChild(block);
  }

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

    const plain = projects.filter((project) => !project.caseStudy);

    if (plain.length) {
      const list = el('div', 'role-projects');
      plain.forEach((project) => list.appendChild(projectCard(project)));
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

// Data projects get the case-study card from the design reference: a flow strip,
// a short statement and two facts. The bullets stay in the DOM but print-only, so the
// PDF keeps the full detail an ATS needs.
function caseStudyCard(project) {
  const c = project.caseStudy;
  const wrap = el('article', 'project case-study');

  const strip = el('div', 'case-flow grid-bg');
  c.flow.forEach((label, index) => {
    if (index) {
      const conn = el('span', 'mconn');
      const pkt = el('span', 'mpkt');
      pkt.style.animationDelay = (index * 0.6) + 's';
      conn.appendChild(pkt);
      strip.appendChild(conn);
    }
    const hot = index === 1;
    strip.appendChild(el('span', 'flow-node' + (hot ? ' is-hot' : ''), label));
  });
  wrap.appendChild(strip);

  const body = el('div', 'case-body');
  body.appendChild(el('p', 'case-kind', c.kind));
  body.appendChild(el('h3', 'project-name', project.name));
  body.appendChild(el('p', 'case-desc', c.desc));

  const bullets = el('ul', 'case-bullets');
  (project.bullets || []).forEach((bullet) => bullets.appendChild(el('li', null, bullet)));
  body.appendChild(bullets);

  if (project.tech && project.tech.length) body.appendChild(chipList(project.tech));

  const metrics = el('div', 'case-metrics');
  (c.metrics || []).forEach((metric) => {
    const cell = el('div', 'metric');
    cell.appendChild(el('span', 'metric-value', metric.v));
    cell.appendChild(el('span', 'metric-label', metric.l));
    metrics.appendChild(cell);
  });
  body.appendChild(metrics);

  const meta = el('p', 'case-meta', [project.duration, project.role, project.employer].filter(Boolean).join('  \u00b7  '));
  body.appendChild(meta);

  wrap.appendChild(body);
  return wrap;
}

function projectCard(project) {
  if (project.caseStudy) return caseStudyCard(project);

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


/* ---------- the DAG card ---------- */

function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.keys(attrs || {}).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

/* Source marks, drawn rather than imported so they inherit the theme colour.
   Each is a different shape, because four identical cylinders would say nothing
   about what kind of source each one is. */
const SOURCE_SHAPES = {
  database: [
    ['path', { d: 'M2 8v28c0 3.3 7.2 6 16 6s16-2.7 16-6V8', fill: 'var(--cyl-fill)', stroke: 'currentColor', 'stroke-width': '1.5' }],
    ['path', { d: 'M2 17c0 3.3 7.2 6 16 6s16-2.7 16-6M2 26c0 3.3 7.2 6 16 6s16-2.7 16-6', stroke: 'currentColor', 'stroke-opacity': '0.45', 'stroke-width': '1.5' }],
    ['ellipse', { cx: '18', cy: '8', rx: '16', ry: '6', fill: 'var(--cyl-top)', stroke: 'currentColor', 'stroke-width': '1.5' }]
  ],
  files: [
    ['path', { d: 'M4 10v26c0 1.7 1.3 3 3 3h17', fill: 'none', stroke: 'currentColor', 'stroke-opacity': '0.45', 'stroke-width': '1.5', 'stroke-linecap': 'round' }],
    ['path', { d: 'M11 4h12l9 9v20c0 1.7-1.3 3-3 3H11c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3z', fill: 'var(--cyl-fill)', stroke: 'currentColor', 'stroke-width': '1.5' }],
    ['path', { d: 'M23 4v9h9', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }],
    ['path', { d: 'M14 23h12M14 29h8', stroke: 'currentColor', 'stroke-opacity': '0.55', 'stroke-width': '1.5', 'stroke-linecap': 'round' }]
  ],
  bucket: [
    ['path', { d: 'M3 9h30l-2.6 26.3A4 4 0 0 1 26.4 39H9.6a4 4 0 0 1-4-3.7L3 9z', fill: 'var(--cyl-fill)', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }],
    ['ellipse', { cx: '18', cy: '9', rx: '15', ry: '5', fill: 'var(--cyl-top)', stroke: 'currentColor', 'stroke-width': '1.5' }],
    ['path', { d: 'M8 20h20M9 28h18', stroke: 'currentColor', 'stroke-opacity': '0.4', 'stroke-width': '1.5', 'stroke-linecap': 'round' }]
  ],
  api: [
    ['rect', { x: '3', y: '7', width: '30', height: '30', rx: '7', fill: 'var(--cyl-fill)', stroke: 'currentColor', 'stroke-width': '1.5' }],
    ['path', { d: 'M14 16l-4 6 4 6M22 16l4 6-4 6', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }]
  ]
};

function sourceMark(kind) {
  const svg = svgEl('svg', { class: 'cyl', width: '36', height: '44', viewBox: '0 0 36 44', fill: 'none', 'aria-hidden': 'true' });
  (SOURCE_SHAPES[kind] || SOURCE_SHAPES.database).forEach((spec) => svg.appendChild(svgEl(spec[0], spec[1])));
  return svg;
}

// One isometric block of a lakehouse layer.
function block(color, delay) {
  const svg = svgEl('svg', { class: 'blk', width: '56', height: '49', viewBox: '0 0 64 56', 'aria-hidden': 'true' });
  svg.style.color = color;
  svg.style.animationDelay = delay;
  svg.appendChild(svgEl('polygon', { points: '32,0 64,16 32,32 0,16', fill: 'currentColor', 'fill-opacity': '0.9' }));
  svg.appendChild(svgEl('polygon', { points: '0,16 32,32 32,56 0,40', fill: 'currentColor', 'fill-opacity': '0.35' }));
  svg.appendChild(svgEl('polygon', { points: '32,32 64,16 64,40 32,56', fill: 'currentColor', 'fill-opacity': '0.58' }));
  svg.appendChild(svgEl('polyline', { points: '0,16 32,32 64,16', fill: 'none', stroke: 'var(--bg)', 'stroke-opacity': '0.5' }));
  return svg;
}

function renderDag(data) {
  const p = data.pipeline;
  if (!p) return;

  document.querySelector('.dag-id').textContent = p.dagName;
  document.querySelector('.dag-meta').textContent = '\u00b7 ' + p.dagMeta;
  document.querySelector('.dag-status-text').textContent = p.statusLabel;

  const sources = document.querySelector('.source-list');
  sources.textContent = '';
  (p.sources || []).forEach((item) => {
    const row = el('div', 'source');
    row.appendChild(sourceMark(item.icon));
    const text = el('div');
    text.appendChild(el('p', 'source-name', item.name));
    text.appendChild(el('p', 'source-kind', item.kind));
    row.appendChild(text);
    sources.appendChild(row);
  });

  document.querySelector('.engine-name').textContent = p.process.name;
  document.querySelector('.engine-detail').textContent = p.process.detail;

  const layers = document.querySelector('.layers');
  layers.textContent = '';
  (p.layers || []).forEach((layer) => {
    const col = el('div', 'layer');
    const stack = el('div', 'layer-stack');
    for (let i = 0; i < layer.blocks; i += 1) stack.appendChild(block(layer.color, (i * 0.45) + 's'));
    col.appendChild(stack);
    col.appendChild(el('p', 'layer-name', layer.name));
    layers.appendChild(col);
  });

  const note = document.querySelector('.store-note');
  note.textContent = p.store || '';
  note.hidden = !p.store;
}

/* ---------- stage cards ---------- */

const STAGE_ICONS = {
  extract: [['ellipse', { cx: '12', cy: '5', rx: '8', ry: '3' }], ['path', { d: 'M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3' }]],
  load: [['path', { d: 'M12 3v11M7 9l5 5 5-5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4' }]],
  serve: [['path', { d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' }]]
};

// Transform is the stage this whole page is about, so it carries the spark: a filled
// four-point mark rather than a stroked outline, and the warm colour instead of aqua.
const SPARK_ICON = [['path', { d: 'M13 2c.8 6 2.8 8 9 9-6.2 1-8.2 3-9 9-.8-6-2.8-8-9-9 6.2-1 8.2-3 9-9z' }]];

function stageIcon(name) {
  const filled = name === 'spark';
  const attrs = {
    class: 'stage-icon', width: '22', height: '22', viewBox: '0 0 24 24', 'aria-hidden': 'true'
  };
  if (filled) {
    attrs.fill = 'currentColor';
  } else {
    attrs.fill = 'none';
    attrs.stroke = 'currentColor';
    attrs['stroke-width'] = '1.8';
    attrs['stroke-linecap'] = 'round';
    attrs['stroke-linejoin'] = 'round';
  }
  const svg = svgEl('svg', attrs);
  (filled ? SPARK_ICON : (STAGE_ICONS[name] || STAGE_ICONS.serve)).forEach((spec) => svg.appendChild(svgEl(spec[0], spec[1])));
  return svg;
}

function pick(value, mode) {
  return (value && typeof value === 'object' && !Array.isArray(value)) ? value[mode] : value;
}

function renderStages(data, mode) {
  const target = document.querySelector('.stage-cards');
  const modes = data.pipelineModes;
  if (!target || !modes) return;

  const caption = document.querySelector('.mode-caption');
  if (caption) caption.textContent = modes.captions[mode] || '';

  document.querySelectorAll('.mode-btn').forEach((button) => {
    const on = button.getAttribute('data-mode') === mode;
    button.setAttribute('aria-pressed', String(on));
    button.classList[on ? 'add' : 'remove']('is-on');
  });

  target.textContent = '';
  (modes.order[mode] || []).forEach((key, index) => {
    const def = data.stageDefs[key];
    if (!def) return;

    const hot = key === 'transform';
    const card = el('article', 'stage-card' + (hot ? ' is-hot' : ''));

    const head = el('div', 'stage-head');
    head.appendChild(el('span', 'stage-num', '0' + (index + 1)));
    const box = el('span', 'stage-icon-box');
    box.appendChild(stageIcon(def.icon));
    head.appendChild(box);
    card.appendChild(head);

    card.appendChild(el('h3', 'stage-name', def.name));
    card.appendChild(el('p', 'stage-detail', pick(def.desc, mode)));
    card.appendChild(chipList(pick(def.tools, mode) || []));
    target.appendChild(card);
  });
}

function initModeSwitch(data) {
  const modes = data.pipelineModes;
  if (!modes) return;
  let mode = modes.default || 'ELT';
  renderStages(data, mode);
  document.querySelectorAll('.mode-btn').forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.getAttribute('data-mode');
      renderStages(data, mode);
    });
  });
}

function renderCta(data) {
  if (!data.cta) return;
  document.querySelector('.cta-headline').textContent = data.cta.headline;
  document.querySelector('.cta-copy').textContent = data.cta.copy;
}

function renderProfile(data) {
  // The reference colours part of the headline; here that is the surname.
  const nameNode = document.querySelector('.profile-name');
  nameNode.textContent = '';
  const parts = data.name.split(/\s+/).filter(Boolean);
  const surname = parts.length > 1 ? parts.pop() : '';
  if (parts.length) nameNode.appendChild(document.createTextNode(parts.join(' ') + ' '));
  nameNode.appendChild(el('span', 'name-accent', surname || data.name));
  document.querySelector('.profile-role').textContent = data.role;
  document.querySelector('.hero-tagline').textContent = data.tagline || '';
  document.querySelector('.profile-summary').textContent = data.summary;
  document.querySelector('.profile-summary-ats').textContent = atsSummary(data);
  document.querySelector('.nav-initials').textContent = wordmark(data.name);
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
  renderDag(data);
  initModeSwitch(data);
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
