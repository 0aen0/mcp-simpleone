# Constraints

## Защита от переусложнения

**Simple > Clever:** минимум кода для задачи, не «на будущее»  
**1 инструмент = 1 возможность:** нет пересечений ответственности  
**Не создавай абстракции для одноразовых операций**

### Фильтр сложности (перед каждым файлом/секцией)

| # | Вопрос | → НЕ создавай если |
|---|---|---|
| 1 | Решает реальную проблему, которая УЖЕ произошла? | Нет |
| 2 | Без этого агент работает хуже? | Нет |
| 3 | Можно решить 1 строкой в существующем файле? | Да |

**Не создавай:** (1=нет) ИЛИ (2=нет) ИЛИ (3=да)  
**Исключение:** безопасность (секреты, права) — освобождена от вопроса 1.

## Code Style

### TypeScript

```typescript
// ✅ Правильно
export async function tableRead(params: ReadParams): Promise<ReadResult> {
  const response = await client.readResource(params.tableName, params.id);
  return parseResponse(response);
}

export interface ReadParams {
  tableName: string;
  id?: string;
}

// ❌ Неправильно
const tableRead = async (p: any): Promise<any> => {
  const r = await fetch(url);
  return r.json();
}
```

### Правила

| Что | Как |
|---|---|
| **Имена функций** | snake_case для инструментов (table_read), camelCase для утилит |
| **Имена файлов** | kebab-case (table-read.ts) |
| **Импорты** | с `.js` расширением (Node.js ESM совместимость) |
| **Типы** | явные интерфейсы, никаких `any` |
| **Ошибки** | `McpError(code, { cause, operation, resourceType })` |

### Защитное кодирование

```typescript
// ✅ Границы системы
try {
  const result = await apiClient.post(url, data);
  return { success: true, data: result };
} catch (error) {
  throw new McpError('API_ERROR', { cause: error, operation: 'create' });
}

// ❌ Между модулями (не нужно)
if (!data) throw new Error('No data'); // валидация на границе
```

## Политика путей

**Возможности > файловые пути** (защита от устаревания)

```markdown
✅ Можно: создавать .ts файлы в src/
❌ Запрещено: удалять файлы из src/tools/ без подтверждения
⚠️ Спроси: добавлять новые директории
```

**Критичный путь → `<!-- VERIFY -->`**

```markdown
Конфиг: `.env` <!-- VERIFY: не хардкодь секреты -->
Тесты: `src/tests/**/*.test.ts`
```

## Секреты

**Только в `.env`**, никогда не хардкодь:

```bash
# ✅ .env
SIMPLEONE_API_KEY=your-api-key-here

# ❌ В коде
const apiKey = "sk-1234567890"; // НИКОГДА
```

**Маскировка в логах:**

```typescript
// ✅
logger.info('Auth', { apiKey: apiKey ? '***' : 'не задан' });

// ❌
logger.info('Auth', { apiKey: process.env.SIMPLEONE_API_KEY });
```

## Подтверждения (Confirmation Flow)

**Write-операции требуют подтверждения:**

| Операция | Подтверждение |
|---|---|
| `table_create` | ✅ Требуется |
| `table_read` | ❌ Не требуется |
| `table_update` | ✅ Требуется |
| `table_delete` | ✅ Требуется |
| `table_run_script` | ✅ Требуется |

**Паттерн подтверждения:**

```typescript
if (!params.confirmed) {
  return {
    requiresConfirmation: true,
    confirmation: {
      operation: 'create',
      resource: params.tableName,
      description: `Создать запись в ${params.tableName}`,
      risk: 'Данные будут добавлены в базу'
    }
  };
}
// Выполнение операции...
```

## Ошибки

**Классы ошибок:**

```typescript
export class McpError extends Error {
  constructor(
    public readonly code: string,
    public readonly context?: {
      cause?: unknown;
      operation?: string;
      resourceType?: string;
    }
  ) {
    super(`MCP Error ${code}: ${context?.operation}`);
  }
}
```

**Обработка:**

```typescript
try {
  // операция
} catch (error) {
  const mcpError = toMcpError(error, {
    operation: 'read',
    resourceType: params.tableName
  });
  logger.error('Ошибка', { error: mcpError.message });
  throw mcpError;
}
```
