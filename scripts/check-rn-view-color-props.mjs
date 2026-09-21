import fs from 'node:fs';
import path from 'node:path';

const roots = ['apps/customer-app', 'apps/driver-app'];
const viewTags = ['View', 'TouchableOpacity', 'Pressable', 'Animated.View', 'SafeAreaView', 'ScrollView', 'TextInput', 'FlatList', 'SectionList', 'ImageBackground'];
const tagPattern = viewTags.join('|');

const invalidPatterns = [
  new RegExp(`<\\s*(?:${tagPattern})[^>]*\\bcolor\\s*=\\s*\\{?[^>]*>`, 'gi'),
  new RegExp(`<\\s*(?:${tagPattern})[^>]*style\\s*=\\s*\\{\\s*\{[^}]*\\bcolor\\s*:\s*[^}]*\}`, 'gi'),
  new RegExp(`<\\s*(?:${tagPattern})[^>]*style\\s*=\\s*\[\s*[^\]]*\{[^\]]*\\bcolor\\s*:\s*[^\]]*\}\s*\]`, 'gi'),
];

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.expo') continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const text = fs.readFileSync(full, 'utf8');
      const matches = new Set();
      for (const pattern of invalidPatterns) {
        const result = text.match(pattern);
        if (result) {
          for (const match of result) matches.add(match.trim());
        }
      }
      if (matches.size) {
        findings.push({ file: full, matches: [...matches] });
      }
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}

if (findings.length) {
  console.error('Unsafe React Native color usage detected on native view elements:');
  for (const finding of findings) {
    console.error(`\n- ${finding.file}`);
    for (const match of finding.matches) {
      console.error(`  ${match.slice(0, 180)}`);
    }
  }
  process.exit(1);
}

console.log('No direct View/TouchableOpacity/Pressable color prop/style misuse found in the mobile apps.');
