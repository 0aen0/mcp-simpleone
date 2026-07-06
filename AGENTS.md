# SimpleOne MCP Server

**Версия:** 1.9.0

## Commands
- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка TypeScript
- `npm test` — запуск тестов
- `npm run lint` — ESLint проверка
- `npm start` — запуск собранного сервера
- `npm run build:standalone` — сборка автономной версии
- `rtk init --global` — инициализация CLI compression
- `rtk <command>` — сжатый вывод CLI команд
- `git checkout HEAD~1 -- .rules/` — откат правил
- `/debug` — трассировка правил (после ответа)

## Testing
- **Фреймворк:** Vitest + @testing-library
- **Файлы:** `*.test.ts` рядом с модулем
- **Запуск:** `npm test` (все) / `npm test -- filename` (один)
- **Покрытие:** 58/58 ✅ (100%)

## Project Shape
MCP-сервер для интеграции с SimpleOne (ESM) через REST API.
4 инструмента: CRUD (table_create, table_read, table_update, table_delete).
Все write-операции требуют подтверждения пользователя.

**Параметры query:**
- Поддерживаемые операторы: `=`, `!=`, `>`, `<`, `>=`, `<=`, `LIKE`, `IN`, `ISEMPTY`, `ISNOTEMPTY`, `CHANGESTO`, `CHANGES`, `^` (AND), `^OR` (OR), `DYNAMIC`
- Dot-walking: поддерживается в query и fields (например: `assigned_user.department=IT`)
- no_count: отключение подсчёта записей для оптимизации
- Параметры маппятся на официальные `sysparm_*` Table API: [документация SimpleOne](https://docs.simpleone.ru/platform/developer/integration/rest-api/table-api)

**HTTP методы:**
- GET (READ), POST (CREATE), PATCH (частичное UPDATE), PUT (полное UPDATE), DELETE

## Code Style
```typescript
// ✅
export async function esmRead(params: ReadParams): Promise<ReadResult> {
  const response = await apiClient.get(`/api/${params.resourceType}/${params.id}`);
  return parseResponse(response);
}

export interface ReadParams {
  resourceType: string;
  id?: string;
}

// ❌
const esmRead = async (p: any): Promise<any> => {
  const r = await fetch(url);
  return r.json();
}
```

## Git Workflow
- **Ветки:** `feat/`, `fix/`, `chore/`
- **Коммиты:** Conventional Commits
- **PR:** review → merge в main

## Boundaries
| ✅ Можно | ⚠️ Спроси | ❌ Запрещено |
|---|---|---|
| Создавать .ts файлы | Добавлять зависимости | ESM-операции без подтверждения |
| Запускать dev/test/lint | Менять .env шаблон | Хардкодить секреты |
| Генерировать MCP tools | Изменять auth-конфиг | Удалять данные без явного OK |

→ Full rules: `.rules/`
