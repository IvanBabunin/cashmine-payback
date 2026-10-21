#!/usr/bin/env node
// Одноразове налаштування проєкту з шаблону.
// Інтерактивно:    npm run setup
// Без питань:      npm run setup -- --name "My App" --nav tabs
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...parts) => join(root, ...parts);

const NAV = {
  tabs: {
    group: '(tabs)',
    label: 'A — tabs: кожен таб — папка з _layout (Stack) + index; група `(tabs)`',
  },
  stack: { group: '(main)', label: 'B — stack (рівні): один Stack на всі рівні; група `(main)`' },
  mixed: { group: '(tabs)', label: 'C — tabs з рівнями всередині табів; група `(tabs)`' },
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key.startsWith('--')) args[key.slice(2)] = argv[i + 1]?.startsWith('--') ? true : argv[++i];
  }
  return args;
}

const UA = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'iu',
  я: 'ia',
  ы: 'y',
  э: 'e',
  ё: 'io',
  ъ: '',
};

const toSlug = (name) =>
  [...name.toLowerCase()]
    .map((ch) => UA[ch] ?? ch)
    .join('')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'app';

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function ask(lines, question, { validate, fallback } = {}) {
  for (;;) {
    const hint = fallback ? ` (${fallback})` : '';
    process.stdout.write(`${question}${hint}: `);
    const next = await lines.next();
    if (next.done) fail('Ввід закінчився раніше, ніж усі відповіді.');
    if (!process.stdin.isTTY) process.stdout.write(`${next.value}\n`);
    const answer = next.value.trim() || fallback || '';
    const error = validate?.(answer);
    if (!error) return answer;
    console.log(`  ${error}`);
  }
}

function replaceInFile(file, pairs) {
  let text = readFileSync(file, 'utf8');
  for (const [from, to] of pairs) text = text.split(from).join(to);
  writeFileSync(file, text);
}

async function main() {
  if (!existsSync(p('navigation'))) fail('Проєкт уже налаштований (папки navigation/ немає).');
  if (existsSync(p('app')) && readdirSync(p('app')).length > 0)
    fail('Папка app/ вже існує і не порожня.');

  const args = parseArgs(process.argv.slice(2));
  const rl = createInterface({ input: process.stdin, terminal: false });
  const lines = rl[Symbol.asyncIterator]();

  const name =
    typeof args.name === 'string'
      ? args.name
      : await ask(lines, 'Назва застосунку', { validate: (v) => (v ? null : 'Назва обовʼязкова') });
  const slug = toSlug(name);

  let nav = typeof args.nav === 'string' ? args.nav : null;
  if (!nav) {
    console.log('\nНавігація:');
    console.log('  1) tabs  — таб-бар знизу');
    console.log('  2) stack — рівні без табів (список → деталі → …)');
    console.log('  3) mixed — таби, а всередині табів рівні');
    const choice = await ask(lines, 'Обери 1–3', {
      fallback: '1',
      validate: (v) => (['1', '2', '3'].includes(v) ? null : 'Введи 1, 2 або 3'),
    });
    nav = { 1: 'tabs', 2: 'stack', 3: 'mixed' }[choice];
  }
  if (!NAV[nav]) fail(`Невідомий варіант навігації: ${nav}. Доступні: tabs, stack, mixed.`);
  rl.close();

  // 1. app/ = спільні роути + обраний варіант
  cpSync(p('navigation', '_shared'), p('app'), { recursive: true });
  cpSync(p('navigation', nav), p('app'), { recursive: true });
  replaceInFile(p('app', '_layout.tsx'), [['__NAV_GROUP__', NAV[nav].group]]);

  // 2. Назва і slug
  const pairs = [
    ['__APP_NAME__', name.replace(/'/g, "\\'")],
    ['__APP_SLUG__', slug],
  ];
  replaceInFile(p('app.config.ts'), pairs);
  replaceInFile(p('package.json'), pairs);
  if (existsSync(p('package-lock.json'))) replaceInFile(p('package-lock.json'), pairs);
  replaceInFile(p('README.md'), pairs);

  // 3. Навігація в CLAUDE.md
  replaceInFile(p('CLAUDE.md'), [['{{NAV}}', NAV[nav].label]]);

  // 4. Прибрати одноразове
  const pkg = JSON.parse(readFileSync(p('package.json'), 'utf8'));
  delete pkg.scripts.setup;
  writeFileSync(p('package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  rmSync(p('navigation'), { recursive: true, force: true });
  rmSync(p('scripts', 'setup.mjs'), { force: true });
  if (existsSync(p('scripts')) && readdirSync(p('scripts')).length === 0)
    rmSync(p('scripts'), { recursive: true });

  console.log(`
✔ Готово: ${name}, навігація: ${nav}

Далі:
  1. cp .env.example .env  і вкажи EXPO_PUBLIC_API_URL / EXPO_PUBLIC_API_TOKEN
  2. npm start
  3. Деплой на Vercel при push у main: README → Deploy
`);
}

main().catch((error) => fail(error.message));
