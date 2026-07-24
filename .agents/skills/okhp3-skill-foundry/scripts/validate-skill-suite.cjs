#!/usr/bin/env node

/**
 * Dependency-free structural validator for Agent Skills directories.
 * It validates the portable Agent Skills contract; it does not execute a skill.
 */
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const dirIndex = args.indexOf('--skills-dir');
const rootIndex = args.indexOf('--root');
const targetDir = path.resolve(
  rootIndex >= 0 ? args[rootIndex + 1] : dirIndex >= 0 ? args[dirIndex + 1] : '.agents/skills'
);
const recursive = rootIndex >= 0;
const errors = [];
const warnings = [];
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SPEC_NAME_MAX = 64;
const PACKAGE_NAME_MAX = 36;
const DESCRIPTION_MAX = 1024;
const COMPATIBILITY_MAX = 500;
const BODY_LINE_MAX = 500;
const PATH_MAX = 180;
const ENTRY_NAME_MAX = 64;

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function readFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!text.startsWith('---\n')) return { text, frontmatter: '', body: text };
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return { text, frontmatter: '', body: text };
  return { text, frontmatter: text.slice(4, end), body: text.slice(end + 5) };
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
  for (const match of body.matchAll(/`((?:references|assets|scripts)\/[^`\s]+)[^`]*`/g)) found.add(match[1]);
  for (const ref of found) {
    if (path.isAbsolute(ref) || ref.split('/').includes('..')) {
      fail(`${skillDir}: reference must stay inside the skill package: ${ref}`);
      continue;
    }
    if (/[?*\[]/.test(ref)) continue;
    if (!fs.existsSync(path.join(skillDir, ref))) fail(`${skillDir}: missing referenced file ${ref}`);
  }
}
function findSkills(dir, deep) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === '.git' || entry.name === 'node_modules') continue;
    const child = path.join(dir, entry.name);
    if (fs.existsSync(path.join(child, 'SKILL.md'))) results.push(child);
    else if (deep) results.push(...findSkills(child, true));
  }
  return results;
}
function validatePortablePaths(skillDir, rootDir) {
  const stack = [skillDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(current, entry.name);
      const relative = path.relative(rootDir, full).split(path.sep).join('/');
      if (entry.name.length > ENTRY_NAME_MAX) fail(`${skillDir}: path element exceeds ${ENTRY_NAME_MAX} characters: ${entry.name}`);
      if (relative.length > PATH_MAX) fail(`${skillDir}: path exceeds ${PATH_MAX} characters from scan root: ${relative}`);
      if (entry.isDirectory()) stack.push(full);
    }
  }
}
function validateSkill(skillDir, rootDir) {
  const entry = { name: path.basename(skillDir) };
  const file = path.join(skillDir, 'SKILL.md');
  const { text, frontmatter, body } = readFrontmatter(file);
  const name = scalar(frontmatter, 'name');
  const description = scalar(frontmatter, 'description');
  if (!frontmatter) fail(`${entry.name}: missing or malformed YAML frontmatter`);
  const compatibility = scalar(frontmatter, 'compatibility');
  if (!NAME.test(name) || name !== entry.name || name.length > SPEC_NAME_MAX) fail(`${entry.name}: name must match directory, use lowercase hyphen syntax, and be at most ${SPEC_NAME_MAX} characters`);
  if (entry.name.length > PACKAGE_NAME_MAX) fail(`${entry.name}: package directory exceeds the ${PACKAGE_NAME_MAX}-character portable repository limit`);
  if (!description || description.length > DESCRIPTION_MAX) fail(`${entry.name}: description must be 1-${DESCRIPTION_MAX} characters`);
  if (compatibility.length > COMPATIBILITY_MAX) fail(`${entry.name}: compatibility must be at most ${COMPATIBILITY_MAX} characters`);
  if (body.split('\n').length > BODY_LINE_MAX) fail(`${entry.name}: SKILL.md body exceeds the ${BODY_LINE_MAX}-line progressive-disclosure limit`);
  if (entry.name.startsWith('okhp3-') && !quotedMetadataValue(frontmatter, 'version')) fail(`${entry.name}: OKHP3 metadata.version must be a quoted semver string`);
  if (entry.name.startsWith('okhp3-') && !body.includes('## About')) fail(`${entry.name}: missing About footer`);
  if (!body.includes('Scope')) warn(`${entry.name}: consider an explicit Scope section`);
  if (!body.match(/plan|validate|verify/i)) warn(`${entry.name}: no obvious validation loop found`);
  if (text.match(/ignore (all|any|previous)|system message|developer message|exfiltrat/i)) warn(`${entry.name}: review instruction-like security markers manually`);
  references(body, skillDir);
  validatePortablePaths(skillDir, rootDir);
}
if (!fs.existsSync(targetDir)) fail(`skills directory does not exist: ${targetDir}`);
else {
  const skillDirs = findSkills(targetDir, recursive);
  for (const skillDir of skillDirs) validateSkill(skillDir, targetDir);
}
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Validated ${fs.existsSync(targetDir) ? findSkills(targetDir, recursive).length : 0} skill packages${recursive ? ' recursively' : ''}.`);
if (errors.length) process.exit(1);
