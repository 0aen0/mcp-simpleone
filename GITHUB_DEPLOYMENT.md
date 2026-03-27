# SimpleOne MCP Server — GitHub Deployment Guide

## Чек-лист перед публикацией

### ✅ Подготовлено

- [x] LICENSE файл (MIT)
- [x] README.md с бейджами
- [x] .gitignore (обновлён)
- [x] .gitattributes
- [x] Все тесты проходят (58/58)
- [x] Сборка без ошибок
- [x] URL заменены на шаблонные

### 📁 Структура репозитория

```
mcp-simpleone/
├── src/
│   ├── api/                # API клиент
│   ├── tools/              # MCP инструменты
│   ├── utils/              # Утилиты
│   ├── tests/              # Тесты
│   └── index.ts            # Точка входа
├── scripts/
│   └── simpleone/          # CLI утилиты
├── .rules/                 # Внутренние правила
├── .gitignore
├── .gitattributes
├── LICENSE
├── README.md
├── MCP_SETUP.md
├── DEPLOYMENT.md
├── LOGGING.md
├── QUERY_EXAMPLES.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 🔧 Команды для публикации

```bash
# 1. Проверка
npm run lint
npm run build
npm test

# 2. Инициализация git (если ещё не сделан)
git init
git add .
git commit -m "Initial commit: SimpleOne MCP Server v1.0.0"

# 3. Создание репозитория на GitHub
# https://github.com/new → создать пустой репозиторий

# 4. Привязка remote
git remote add origin https://github.com/YOUR_USERNAME/mcp-simpleone.git

# 5. Отправка
git branch -M main
git push -u origin main
```

### 📝 Описание для GitHub

**Short description:**
```
MCP-сервер для интеграции с SimpleOne (ESM) через REST API
```

**Topics:**
```
mcp, simpleone, esm, integration, typescript, rest-api, ai, llm
```

### 🚀 GitHub Actions

CI/CD не настроен — проект работает локально без автоматизации.

### ⚠️ Важно

**НЕ коммитить:**
- `.env` — содержит секреты
- `node_modules/` — зависимости
- `dist/` — билд
- `.qwen/` — локальные настройки
- `user-table-structure.json` — пользовательские данные

### 📄 Лицензия

MIT License — см. `LICENSE` файл.
