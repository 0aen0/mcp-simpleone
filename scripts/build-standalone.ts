#!/usr/bin/env node
/**
 * Скрипт сборки автономного MCP-сервера
 * Создаёт самодостаточный каталог для распространения
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(ROOT, 'dist');
const STANDALONE = path.resolve(ROOT, 'standalone', 'mcp-simpleone');

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function copyFile(src: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  log(`  ✓ ${path.relative(ROOT, dest)}`, colors.blue);
}

function writeStandalonePackageJson() {
  const standalonePkg = {
    name: 'mcp-simpleone-standalone',
    version: '1.0.0',
    description: 'MCP-сервер для интеграции с SimpleOne (ESM) - автономная версия',
    type: 'module',
    main: 'dist/index.js',
    bin: {
      'mcp-simpleone': './dist/index.js',
    },
    scripts: {
      start: 'node dist/index.js',
      'start:http': 'node dist/index.js --transport http',
      'start:sse': 'node dist/index.js --transport sse',
    },
    keywords: ['mcp', 'simpleone', 'esm', 'integration'],
    author: '',
    license: 'MIT',
    engines: {
      node: '>=20.0.0',
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0',
      axios: '^1.6.0',
      dotenv: '^16.3.0',
      express: '^4.18.0',
      zod: '^3.22.0',
    },
  };

  const dest = path.resolve(STANDALONE, 'package.json');
  fs.writeFileSync(dest, JSON.stringify(standalonePkg, null, 2), 'utf8');
  log(`  ✓ standalone/package.json`, colors.blue);
}

function writeReadme() {
  const readme = `# MCP-сервер SimpleOne (автономная версия)

## Быстрый старт

### 1. Настройка

Скопируйте \`.env.example\` в \`.env\` и заполните параметры:

\`\`\`bash
cp .env.example .env
\`\`\`

### 2. Запуск

**stdio транспорт (по умолчанию):**
\`\`\`bash
npm start
\`\`\`

**SSE транспорт:**
\`\`\`bash
npm run start:sse
\`\`\`

**HTTP транспорт:**
\`\`\`bash
npm run start:http
\`\`\`

## Конфигурация (.env)

\`\`\`env
SIMPLEONE_URL=https://your-instance.simpleone.ru
SIMPLEONE_BASIC_USER=your-username
SIMPLEONE_BASIC_PASSWORD=your-password
NODE_TLS_REJECT_UNAUTHORIZED=0
\`\`\`

## Подключение в Qwen Code

Добавьте в настройки MCP-серверов:

\`\`\`json
{
  "mcpServers": {
    "simpleone": {
      "command": "node",
      "args": ["<путь-к-standalone>/dist/index.js"],
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password"
      }
    }
  }
}
\`\`\`

## Требования

- Node.js >= 20.0.0

## Лицензия

MIT
`;

  const dest = path.resolve(STANDALONE, 'README.md');
  fs.writeFileSync(dest, readme, 'utf8');
  log(`  ✓ standalone/README.md`, colors.blue);
}

async function main() {
  log('\n🚀 Сборка автономной версии MCP-сервера\n', colors.green);

  // Шаг 1: Очистка
  log('📁 Очистка...', colors.yellow);
  if (fs.existsSync(STANDALONE)) {
    try {
      fs.rmSync(STANDALONE, { recursive: true, force: true, retryDelay: 500 });
    } catch (error) {
      log(`  ⚠ Не удалось очистить каталог. Попробуйте вручную удалить: ${STANDALONE}`, colors.yellow);
    }
  }
  fs.mkdirSync(STANDALONE, { recursive: true });

  // Шаг 2: Сборка TypeScript
  log('\n🔨 Сборка TypeScript...', colors.yellow);
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
    log('  ✓ dist/', colors.blue);
  } catch (error) {
    log('❌ Ошибка сборки TypeScript', colors.red);
    process.exit(1);
  }

  // Шаг 3: Копирование dist
  log('\n📦 Копирование скомпилированных файлов...', colors.yellow);
  if (fs.existsSync(DIST)) {
    fs.cpSync(DIST, path.resolve(STANDALONE, 'dist'), { recursive: true });
    log(`  ✓ standalone/dist/`, colors.blue);
  } else {
    log('❌ Каталог dist не найден. Запустите "npm run build"', colors.red);
    process.exit(1);
  }

  // Шаг 4: Создание package.json для установки зависимостей
  log('\n📄 Создание package.json...', colors.yellow);
  writeStandalonePackageJson();

  // Шаг 5: Установка production-зависимостей
  log('\n📦 Установка зависимостей...', colors.yellow);
  
  try {
    execSync(`npm install --omit=dev`, { 
      cwd: STANDALONE, 
      stdio: 'inherit' 
    });
    log('  ✓ node_modules/', colors.blue);
  } catch (error) {
    log('❌ Ошибка установки зависимостей', colors.red);
  }

  // Шаг 6: Копирование конфигов
  log('\n📋 Копирование конфигурационных файлов...', colors.yellow);
  copyFile(path.resolve(ROOT, '.env.example'), path.resolve(STANDALONE, '.env.example'));

  // Шаг 7: Создание README
  log('\n📖 Создание документации...', colors.yellow);
  writeReadme();

  // Шаг 8: Лицензия
  if (fs.existsSync(path.resolve(ROOT, 'LICENSE'))) {
    copyFile(path.resolve(ROOT, 'LICENSE'), path.resolve(STANDALONE, 'LICENSE'));
  }

  // Итог
  log('\n' + '='.repeat(50), colors.green);
  log('✅ Автономная версия готова!', colors.green);
  log('='.repeat(50), colors.green);
  log(`\n📁 Расположение: ${STANDALONE}`);
  log(`\n📋 Для установки скопируйте каталог в нужное место:`);
  log(`   cp -r ${STANDALONE} /path/to/your/apps/`);
  log(`\n🚀 Запуск:`);
  log(`   cd ${STANDALONE}`);
  log(`   cp .env.example .env`);
  log(`   # Отредактируйте .env`);
  log(`   npm start\n`);
}

main().catch((error) => {
  log(`❌ Критическая ошибка: ${error}`, colors.red);
  process.exit(1);
});
