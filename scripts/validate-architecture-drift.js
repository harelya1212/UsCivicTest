#!/usr/bin/env node

/**
 * Sprint 1 guardrail: prevent split-brain architecture between root and src trees.
 * The root tree is the canonical runtime for context/screens used by App.js.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const duplicatesToWatch = [
  {
    root: path.join(projectRoot, 'context', 'AppDataContext.js'),
    src: path.join(projectRoot, 'src', 'context', 'AppDataContext.js'),
    allowShim: true,
  },
  {
    root: path.join(projectRoot, 'screens', 'FamilyScreen.js'),
    src: path.join(projectRoot, 'src', 'screens', 'FamilyScreen.js'),
    allowShim: true,
  },
  {
    root: path.join(projectRoot, 'screens', 'ReviewScreen.js'),
    src: path.join(projectRoot, 'src', 'screens', 'ReviewScreen.js'),
    allowShim: true,
  },
  {
    root: path.join(projectRoot, 'screens', 'EditTestDetailsScreen.js'),
    src: path.join(projectRoot, 'src', 'screens', 'EditTestDetailsScreen.js'),
    allowShim: true,
  },
  {
    root: path.join(projectRoot, 'screens', 'OnboardingScreen.js'),
    src: path.join(projectRoot, 'src', 'screens', 'OnboardingScreen.js'),
    allowShim: true,
  },
  {
    root: path.join(projectRoot, 'screens', 'ProfileScreen.js'),
    src: path.join(projectRoot, 'src', 'screens', 'ProfileScreen.js'),
    allowShim: true,
  },
];

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

function isRootReExportShim(content) {
  const compact = content.replace(/\s+/g, ' ').trim();
  return compact.includes("from '../../context/AppDataContext'");
}

function isScreenReExportShim(content) {
  const compact = content.replace(/\s+/g, ' ').trim();
  return compact.startsWith("export { default } from '../../screens/");
}

const issues = [];

for (const pair of duplicatesToWatch) {
  const rootExists = fs.existsSync(pair.root);
  const srcExists = fs.existsSync(pair.src);

  if (!rootExists || !srcExists) {
    continue;
  }

  const rootContent = fs.readFileSync(pair.root, 'utf8').trim();
  const srcContent = fs.readFileSync(pair.src, 'utf8').trim();

  if (pair.allowShim) {
    if (isRootReExportShim(srcContent) || isScreenReExportShim(srcContent)) {
      continue;
    }
  }

  if (rootContent !== srcContent) {
    issues.push({
      type: 'drift',
      root: toRelative(pair.root),
      src: toRelative(pair.src),
    });
  }
}

if (issues.length > 0) {
  console.error('Architecture drift detected between canonical root tree and src duplicates:');
  for (const issue of issues) {
    console.error(`- ${issue.src} diverges from ${issue.root}`);
  }
  console.error('\nFix by removing/merging duplicate implementations or making src files re-export the root module.');
  process.exit(1);
}

console.log('Architecture drift check passed: no unexpected root/src divergence found.');
