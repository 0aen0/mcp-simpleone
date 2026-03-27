**MCP-сервер для SimpleOne (ESM)** — CRUD через REST API.

- **Стек:** Node.js 20+, TypeScript 5.x (strict), MCP SDK, Axios, Express, Vitest
- **Команды:** `npm run dev` | `npm run build` | `npm test` | `npm run lint`
- **Версия:** 1.9.0

## Инструменты

| Tool | Описание | Подтверждение |
|---|---|---|
| `table_create` | Создание записи | ✅ Требуется (отключается через `SIMPLEONE_AUTO_CONFIRM=true`) |
| `table_read` | Чтение (ID или список) | ❌ Не требуется |
| `table_update` | Обновление записи | ✅ Требуется |
| `table_delete` | Удаление записи | ✅ Требуется |

→ CLI-скрипты: `scripts/simpleone/*.js --help`

## Правила

1. **Write-операции только после подтверждения** — блокируй без явного OK
2. **Секреты в .env** — никогда не хардкодь, маскируй в логах
3. **TypeScript strict** — никаких `any`, явные интерфейсы
4. **1 инструмент = 1 операция** — не объединяй
5. **Ошибки с контекстом** — `McpError(code, { cause, operation, resourceType })`
6. **SimpleOne код — только после чтения правил** — читать `.rules/simpleone-project.md`

→ **Full rules:** `.rules/` | **Setup:** `MCP_SETUP.md`

## Boundaries

| ✅ Можно | ⚠️ Спроси | ❌ Запрещено |
|---|---|---|
| Создавать .ts файлы | Добавлять зависимости | ESM-операции без подтверждения |
| Запускать dev/test/lint | Менять .env шаблон | Хардкодить секреты |
| Генерировать MCP tools | Изменять auth-конфиг | Удалять данные без явного OK |

**Тесты:** `npm test` (58/58 ✅) | **Health:** `curl http://localhost:3000/health`

## Qwen Added Memories
- mcp-simpleone проект: MCP-сервер для SimpleOne (ESM) с 4 CRUD инструментами (table_create, table_read, table_update, table_delete). Стек: Node.js 20+, TypeScript 5.x strict, MCP SDK, Axios, Express, Vitest. Все write-операции требуют подтверждения (SIMPLEONE_AUTO_CONFIRM=true для автоматизации). Структура: src/ (код), scripts/simpleone/ (10 CLI-утилит), .rules/ (10 файлов ядра ~1200 строк). Адаптеры: AGENTS.md (центральный), QWEN.md (Qwen Code). Транспорт: SSE (http://localhost:3000/sse) или stdio. Тесты: 58/58 ✅. Правила: код только после OK на план, секреты в .env, TypeScript strict без any, SimpleOne код после чтения .rules/simpleone-project.md.
