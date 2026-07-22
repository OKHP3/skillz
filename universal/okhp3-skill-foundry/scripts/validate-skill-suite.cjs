#!/usr/bin/env node

/**
 * Dependency-free structural validator for a flat .agents/skills directory.
 * It validates the portable Agent Skills contract; it does not execute a skill.
 */
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const dirIndex = args.indexOf('--skills-dir');
const skillsDir = path.resolve(dirIndex >= 0 ? args[dirIndex + 1] : '.agents/skills');
const errors = [];
const warnings = [];
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function readFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---\n')) return { text, frontmatter: '', body: text };
  const end = text.indexOf('\n---', 4);
  if (end < 0) return { text, frontmatter: '', body: text };
  return { text, frontmatter: text.slice(4, end), body: text.slice(end + 4) };
}
function scalar(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const index = lines.findIndex(line => new RegExp(`^${key}:\\s*`).test(line));
  if (index < 0) return '';
  const first = lines[index].replace(new RegExp(`^${key}:\\s*`), '').trim();
  if (first !== '>' && first !== '|') return first.replace(/^['"]|['"]$/g, '');
  const continuation = [];
  for (const line of lines.slice(index + 1)) {
    if (/^[A-Za-z0-9_-]+:/.test(line)) break;
    continuation.push(line.trim());
  }
  return continuation.join(' ').trim();
}
function quotedMetadataValue(frontmatter, key) {
  return new RegExp(`^\\s{2}${key}:\\s*(["']).*\\1\\s*$`, 'm').test(frontmatter);
}
function references(body, skillDir) {
  const found = new Set();
  for (const match of body.matchAll(/`((?:references|assets|scripts)\/[^`]+)`/g)) found.add(match[1]);
  for (const ref of found) if (!fs.existsSync(path.join(skillDir, ref))) fail(`${skillDir}: missing referenced file ${ref}`);
}

if (!fs.existsSync(skillsDir)) fail(`skills directory does not exist: ${skillsDir}`);
else {
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.'));
  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry.name);
    const file = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(file)) { fail(`${entry.name}: missing SKILL.md`); continue; }
    const { text, frontmatter, body } = readFrontmatter(file);
    const name = scalar(frontmatter, 'name');
    const description = scalar(frontmatter, 'description');
    if (!frontmatter) fail(`${entry.name}: missing or malformed YAML frontmatter`);
    if (!NAME.test(name) || name !== entry.name) fail(`${entry.name}: name must match directory and use lowercase hyphen syntax`);
    if (!description || description.length > 1024) fail(`${entry.name}: description must be 1-1024 characters`);
    if (body.split(/\r?\n/).length > 500) fail(`${entry.name}: SKILL.md body exceeds 500 lines`);
    if (entry.name.startsWith('okhp3-') && !quotedMetadataValue(frontmatter, 'version')) fail(`${entry.name}: OKHP3 metadata.version must be a quoted semver string`);
    if (entry.name.startsWith('okhp3-') && !body.includes('## About')) fail(`${entry.name}: missing About footer`);
    if (!body.includes('Scope')) warn(`${entry.name}: consider an explicit Scope section`);
    if (!body.match(/plan|validate|verify/i)) warn(`${entry.name}: no obvious validation loop found`);
    if (text.match(/ignore (all|any|previous)|system message|developer message|exfiltrat/i)) warn(`${entry.name}: review instruction-like security markers manually`);
    references(body, skillDir);
  }
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Validated ${fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.')).length : 0} skill directories.`);
if (errors.length) process.exit(1);
