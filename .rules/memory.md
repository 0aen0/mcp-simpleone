# Memory

## Decisions

| Дата | Решение | Почему |
|---|---|---|
| 2026-03-24 | Vitest 3.2.4 для Node.js v25 | Vitest 1.6.1 несовместим с Node.js v25 |
| 2026-03-24 | Исправлены импорты в тестах | Тесты импортировали `esm-*` вместо `table-*` |
| 2026-03-24 | Добавлен vite-tsconfig-paths | Для разрешения `.js` расширений в импортах |
| 2026-03-25 | Чтение правил перед кодом SimpleOne | Обязательно читать templates/rules/ перед написанием скриптов |
| 2026-03-25 | Удалён `table_run_script` | Инструмент не требовался — только CRUD операции |
| 2026-03-25 | Добавлен `no_count` параметр | Оптимизация для больших выборок (отключение COUNT) |
| 2026-03-25 | Добавлен `putResource()` | Полное обновление записей (PUT метод) |
| 2026-03-25 | 100% покрытие тестами | 40 тестов на параметры, операторы query, dot-walking |

## Policy

**⚠️ КРИТИЧНО: SimpleOne код — только после чтения правил**

Перед написанием любого кода для SimpleOne (скрипты, бизнес-правила, клиентские скрипты, UI-действия, виджеты):

1. **Обязательно читать** `templates/rules/script-rules.mdc`
2. **При необходимости** читать дополнительные правила:
   - `design-system-rules.mdc` — виджеты, дизайн-токены
   - `simple_types/*.mdc` — ACL, уведомления, виджеты и т.д.
   - `project-core-rule.mdc` — основные правила проекта

**Причина:** Пропуск этого шага приводит к созданию кода, не соответствующего стандартам SimpleOne (неправильные имена полей, устаревшее API, нарушение паттернов).

---

**memory.md > 100 строк → каскад:**
1. **Flush** важные факты в `architecture.md` или `constraints.md`
2. **Compaction** старых записей → ссылки
3. **Summarization** (необратимо) старых error traces

**Error traces — НИКОГДА не удаляй!**

---

## Agent Skills (2026-03-25)

**Решение:** Добавлены Agent Skills для Qwen Code по спецификации https://qwenlm.github.io/qwen-code-docs/ru/users/features/skills/

**Созданные skills:**
- `esm-crud` — CRUD-операции с таблицами SimpleOne
- `cli-tools` — вспомогательные CLI-инструменты

**Структура:**
```
.qwen/skills/
├── esm-crud/SKILL.md + scripts/ (symlink → scripts/simpleone/)
└── cli-tools/SKILL.md + scripts/ (symlink → scripts/)
.github/skills/ (symlink для совместимости с Copilot)
├── esm-crud → ../../.qwen/skills/esm-crud
└── cli-tools → ../../.qwen/skills/cli-tools
```

**Обновлённые файлы:**
- `_index.md` — добавлена секция Available Skills
- `_meta.md` — v1.2, + skills в sizing
- `AGENTS.md` — + rtk, откат, /debug
- `debug.md` — новый файл (протокол отладки)

---

## AUTO_CONFIRM (2026-03-25)

**Решение:** Добавлена настройка `SIMPLEONE_AUTO_CONFIRM` для отключения подтверждений в CLI-скриптах и MCP-инструментах.

**Новые файлы:**
- `.env` — добавлено `# SIMPLEONE_AUTO_CONFIRM=false`
- `.env.example` — добавлено `# SIMPLEONE_AUTO_CONFIRM=false`

**Обновлённые файлы:**
- `scripts/simpleone/utils.js` — загрузка `autoConfirm` из `.env`
- `scripts/simpleone/create-record.js` — проверка `config.autoConfirm`
- `scripts/simpleone/update-record.js` — проверка `config.autoConfirm`
- `scripts/simpleone/delete-record.js` — проверка `config.autoConfirm` (двойное подтверждение пропускается)
- `scripts/simpleone/README.md` — документация настройки
- `.qwen/skills/esm-crud/SKILL.md` — документация настройки

**Обновлённые файлы API:**
- `src/config.ts` — загрузка `SIMPLEONE_AUTO_CONFIRM` через Zod
- `src/tools/table-create.ts` — проверка `config.autoConfirm`
- `src/tools/table-update.ts` — проверка `config.autoConfirm`
- `src/tools/table-delete.ts` — проверка `config.autoConfirm`
- `src/tools/table-run-script.ts` — проверка `config.autoConfirm`
- `QWEN.md` — документация настройки
- `MCP_SETUP.md` — документация настройки

**Использование:**
```bash
# В .env:
SIMPLEONE_AUTO_CONFIRM=true

# Или через CLI:
SIMPLEONE_AUTO_CONFIRM=true node scripts/simpleone/create-record.js --table=task --data='{}'

# Или в конфиге MCP-клиента:
{
  "env": {
    "SIMPLEONE_AUTO_CONFIRM": "true"
  }
}
```

**⚠️ Предостережение:** Использовать только в автоматизации/CI! Для локальной разработки оставлять `false`.
