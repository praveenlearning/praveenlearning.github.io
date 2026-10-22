/* Verifies the page renders without a browser.
 *
 *   node check.js
 *
 * Builds a minimal DOM stub, runs the real render path from index.js against
 * data.js, and prints what each section produced. Catches the common failure:
 * a container removed from index.html while its render call stays in index.js,
 * which throws on null and silently blanks every section after it.
 *
 * It does NOT check layout, CSS or the DOCX build. Open the page for those.
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = __dirname;

class Node {
  constructor(tag) {
    this.tag = tag;
    this.className = '';
    this.children = [];
    this._text = '';
    this.attrs = {};
    this.style = {};   // the hero diagram sets inline animation delays
  }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  appendChild(child) { this.children.push(child); return child; }
  remove() {}
  get classList() {
    const self = this;
    return {
      add(name) { if (!(' ' + self.className + ' ').includes(' ' + name + ' ')) self.className = (self.className + ' ' + name).trim(); },
      remove(name) { self.className = self.className.split(/\s+/).filter((c) => c && c !== name).join(' '); },
      toggle(name) { const has = (' ' + self.className + ' ').includes(' ' + name + ' '); this[has ? 'remove' : 'add'](name); return !has; },
      contains(name) { return (' ' + self.className + ' ').includes(' ' + name + ' '); }
    };
  }
  setAttribute(key, value) { this.attrs[key] = value; }
  getAttribute(key) { return this.attrs[key] || null; }
  addEventListener() {}
  querySelector(selector) { return find(this, selector); }
  querySelectorAll(selector) { return findAll(this, selector); }
}

function matches(node, selector) {
  if (selector.startsWith('.')) return (' ' + node.className + ' ').includes(' ' + selector.slice(1) + ' ');
  return node.tag === selector;
}

function findAll(node, selector) {
  const hits = [];
  if (matches(node, selector)) hits.push(node);
  for (const child of node.children) hits.push(...findAll(child, selector));
  return hits;
}

function find(node, selector) {
  if (matches(node, selector)) return node;
  for (const child of node.children) {
    const hit = find(child, selector);
    if (hit) return hit;
  }
  return null;
}

// Build a stand-in for index.html: one node per class attribute it declares.
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const body = new Node('body');
for (const match of html.matchAll(/class="([^"]+)"/g)) {
  const node = new Node('div');
  node.className = match[1];
  body.appendChild(node);
}

global.document = {
  title: '',
  documentElement: new Node('html'),
  createElement: (tag) => new Node(tag),
  createElementNS: (_ns, tag) => new Node(tag),
  createTextNode: (text) => { const n = new Node('#text'); n.textContent = text; return n; },
  querySelector: (selector) => find(body, selector),
  querySelectorAll: (selector) => findAll(body, selector),
  body
};
global.window = {
  docx: null,
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  alert: (message) => { throw new Error('alert: ' + message); }
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };

vm.runInThisContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), { filename: 'data.js' });
vm.runInThisContext(fs.readFileSync(path.join(root, 'index.js'), 'utf8'), { filename: 'index.js' });

const problems = [];

try {
  renderProfile(profileData);
  initTheme();
  initNav();
  initReveal();
} catch (error) {
  console.error('\nRENDER FAILED:', error.message);
  console.error('A container class in index.html probably no longer matches the');
  console.error('querySelector in index.js. Compare the two.\n');
  process.exit(1);
}

function text(selector) {
  const node = document.querySelector(selector);
  return node ? node.textContent.trim() : '';
}

function count(selector, childTag) {
  const node = document.querySelector(selector);
  if (!node) return 0;
  return node.children.filter((c) => !childTag || c.tag === childTag).length;
}

const webSummary = text('.profile-summary');
const atsText = text('.profile-summary-ats');

const report = [
  ['name', text('.profile-name')],
  ['role', text('.profile-role')],
  ['document title', document.title],
  ['theme', document.documentElement.getAttribute('data-theme')],
  ['contact entries', count('.contact-items')],
  ['highlights', count('.highlights')],
  ['skill groups', count('.key-skills')],
  ['employers', count('.all-experiences')],
  ['education entries', count('.all-education')],
  ['roles', count('.all-experiences')],
  ['projects (nested)', document.querySelectorAll('.project').length - document.querySelectorAll('.all-personal-projects .project').length],
  ['personal projects', count('.all-personal-projects')],
  ['certifications', count('.all-certifications')],
  ['social links', count('.social-links')],
  ['tagline', profileData.tagline ? 'set' : 'EMPTY'],
  ['summary words (web)', webSummary.split(/\s+/).filter(Boolean).length],
  ['summary words (ats)', atsText.split(/\s+/).filter(Boolean).length]
];

console.log('');
for (const [label, value] of report) {
  console.log('  ' + label.padEnd(22) + value);
}

if (!text('.ats-pre-header')) problems.push('ATS pre-header is empty: the PDF would lose its plain-text contact block.');
if (document.querySelectorAll('.project').length === 0) problems.push('No projects rendered.');
const companies = profileData.experiences.map((job) => job.company);
const orphaned = profileData.projects.filter((p) => !companies.includes(p.employer));
if (orphaned.length) {
  problems.push('Projects with no matching employer (appended to the last role): ' +
    orphaned.map((p) => p.name + ' -> ' + p.employer).join('; '));
}
if (count('.key-skills') === 0) problems.push('No skill groups rendered.');
if (webSummary && atsText && webSummary === atsText) {
  problems.push('summary and summaryAts are identical: the PDF gains nothing from the split.');
}
for (const field of ['name', 'role', 'summary']) {
  if (!profileData[field]) problems.push('profileData.' + field + ' is empty.');
}
const placeholder = JSON.stringify(profileData).match(/REPLACE-ME|\[Degree|\[Institution|\[Graduation/g);
if (placeholder) problems.push('Placeholders still in data.js: ' + [...new Set(placeholder)].join(', '));

console.log('');
if (problems.length) {
  problems.forEach((p) => console.log('  WARN  ' + p));
  console.log('');
  process.exit(1);
}
console.log('  OK  page renders, no placeholders left.');
console.log('');
