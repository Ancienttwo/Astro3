#!/usr/bin/env node
/*
  Refresh YAML blocks in AGENTS.md from .bmad-core/agents/*.md
  - Looks for sections like: `#### YAML 定义（<id>）` followed by a ```yaml code block
  - Replaces the code block content with the current YAML from the source agent file
*/
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const AGENTS_DIR = path.join(ROOT, '.bmad-core', 'agents');
const TARGET_MD = path.join(ROOT, 'AGENTS.md');

function readFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function extractYamlFromAgent(mdContent) {
  const start = mdContent.indexOf('```yaml');
  if (start === -1) return null;
  const after = start + '```yaml'.length;
  const end = mdContent.indexOf('```', after);
  if (end === -1) return null;
  const inner = mdContent.slice(after, end);
  // Normalize leading/trailing newlines
  return inner.replace(/^\n+/, '').replace(/\n+$/, '') + '\n';
}

function updateYamlBlockInDoc(doc, id, yaml) {
  const heading = `#### YAML 定义（${id}）`;
  const hIdx = doc.indexOf(heading);
  if (hIdx === -1) {
    return { doc, updated: false, reason: 'heading-not-found' };
  }
  const codeStart = doc.indexOf('```yaml', hIdx);
  if (codeStart === -1) {
    return { doc, updated: false, reason: 'code-start-not-found' };
  }
  const codeEnd = doc.indexOf('```', codeStart + 7);
  if (codeEnd === -1) {
    return { doc, updated: false, reason: 'code-end-not-found' };
  }
  const before = doc.slice(0, codeStart);
  const after = doc.slice(codeEnd + 3);
  const replacement = '```yaml\n' + yaml + '```';
  return { doc: before + replacement + after, updated: true };
}

function main() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error(`No agents dir: ${AGENTS_DIR}`);
    process.exit(1);
  }
  if (!fs.existsSync(TARGET_MD)) {
    console.error(`No target doc: ${TARGET_MD}`);
    process.exit(1);
  }

  const agentFiles = fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const idToYaml = new Map();
  for (const file of agentFiles) {
    const id = path.basename(file, '.md');
    const full = path.join(AGENTS_DIR, file);
    const content = readFile(full);
    const yaml = extractYamlFromAgent(content);
    if (!yaml) {
      console.warn(`WARN: No YAML found in ${file}`);
      continue;
    }
    idToYaml.set(id, yaml);
  }

  let doc = readFile(TARGET_MD);
  let changes = 0;
  const missing = [];
  for (const [id, yaml] of idToYaml.entries()) {
    const res = updateYamlBlockInDoc(doc, id, yaml);
    if (res.updated) {
      doc = res.doc;
      changes++;
    } else {
      missing.push({ id, reason: res.reason });
    }
  }

  if (changes > 0) {
    fs.writeFileSync(TARGET_MD, doc, 'utf8');
  }

  console.log(`Refreshed YAML blocks: ${changes}`);
  if (missing.length) {
    console.log('Skipped (not found):');
    for (const m of missing) console.log(` - ${m.id} (${m.reason})`);
  }
}

main();

