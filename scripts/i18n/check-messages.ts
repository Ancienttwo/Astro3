import {promises as fs} from 'node:fs';
import path from 'node:path';

import {NAMESPACES, SUPPORTED_LOCALES} from '../../i18n/messages';

type Issue = {
  locale: string;
  namespace: string;
  missing: string[];
  extra: string[];
};

const BASE_LOCALE = 'en';
const MESSAGES_ROOT = path.resolve(__dirname, '../../i18n/messages');

function flattenKeys(object: unknown, prefix = ''): string[] {
  if (!object || typeof object !== 'object') {
    return prefix ? [prefix.slice(0, -1)] : [];
  }

  const entries = Object.entries(object as Record<string, unknown>);
  if (entries.length === 0) {
    return prefix ? [prefix.slice(0, -1)] : [];
  }

  const keys: string[] = [];
  for (const [key, value] of entries) {
    const nextPrefix = prefix ? `${prefix}${key}.` : `${key}.`;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, nextPrefix));
    } else {
      keys.push(`${prefix}${key}`);
    }
  }
  return keys;
}

async function readNamespace(locale: string, namespace: string): Promise<Record<string, unknown>> {
  const filePath = path.join(MESSAGES_ROOT, locale, `${namespace}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Failed to read ${filePath}: ${(error as Error).message}`);
  }
}

(async () => {
  const locales = SUPPORTED_LOCALES;
  if (!locales.includes(BASE_LOCALE as typeof locales[number])) {
    console.error(`Base locale '${BASE_LOCALE}' is not in SUPPORTED_LOCALES.`);
    process.exit(1);
  }

  const issues: Issue[] = [];

  for (const namespace of NAMESPACES) {
    const baseMessages = await readNamespace(BASE_LOCALE, namespace);
    const baseKeys = new Set(flattenKeys(baseMessages));

    for (const locale of locales) {
      if (locale === BASE_LOCALE) continue;

      try {
        const targetMessages = await readNamespace(locale, namespace);
        const targetKeys = new Set(flattenKeys(targetMessages));

        const missing = [...baseKeys].filter((key) => !targetKeys.has(key));
        const extra = [...targetKeys].filter((key) => !baseKeys.has(key));

        if (missing.length > 0 || extra.length > 0) {
          issues.push({locale, namespace, missing, extra});
        }
      } catch (error) {
        issues.push({locale, namespace, missing: ["__file_missing__"], extra: []});
      }
    }
  }

  if (issues.length > 0) {
    console.error('\n❌ Translation consistency check failed:');
    for (const issue of issues) {
      console.error(`\nLocale: ${issue.locale} | Namespace: ${issue.namespace}`);
      if (issue.missing.includes('__file_missing__')) {
        console.error('  - File missing');
      } else {
        if (issue.missing.length > 0) {
          console.error('  - Missing keys:');
          issue.missing.forEach((key) => console.error(`      • ${key}`));
        }
        if (issue.extra.length > 0) {
          console.error('  - Extra keys:');
          issue.extra.forEach((key) => console.error(`      • ${key}`));
        }
      }
    }
    process.exit(1);
  }

  console.log('✅ Translation namespaces are aligned.');
})();
