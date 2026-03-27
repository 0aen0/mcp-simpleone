# Patterns

## CRUD Операции

### Создание (table_create)

```typescript
// ✅ Паттерн: создание с подтверждением
export async function tableCreateHandler(
  client: SimpleOneClient,
  params: { tableName: string; data: object; confirmed?: boolean }
): Promise<unknown> {
  // Шаг 1: Проверка подтверждения
  if (!params.confirmed) {
    return createConfirmationRequest('create', params.tableName, params.data);
  }

  // Шаг 2: Выполнение операции
  const result = await client.createResource(params.tableName, params.data);
  
  // Шаг 3: Логирование и возврат
  logger.info('Ресурс создан', { tableName: params.tableName, result });
  return { success: true, data: result, meta: { operation: 'esm_create' } };
}

// ❌ Антипаттерн: создание без подтверждения
export async function tableCreateHandler(client, params) {
  const result = await client.createResource(params.tableName, params.data);
  return result; // нет подтверждения, нет логирования
}
```

### Чтение (table_read)

```typescript
// ✅ Паттерн: чтение с поддержкой ID и списка
export async function tableReadHandler(
  client: SimpleOneClient,
  params: { tableName: string; id?: string }
): Promise<unknown> {
  logger.info('Чтение ресурса', { tableName: params.tableName, id: params.id });
  
  const result = await client.readResource(params.tableName, params.id);
  const items = Array.isArray(result) ? result : [result];
  
  logger.info('Ресурс прочитан', { count: items.length });
  return { success: true, data: items, meta: { operation: 'esm_read' } };
}

// ❌ Антипаттерн: только один режим
export async function tableReadHandler(client, tableName) {
  return await client.readResource(tableName); // нет обработки ID
}
```

### Обновление (table_update)

```typescript
// ✅ Паттерн: обновление с подтверждением и логированием
export async function tableUpdateHandler(
  client: SimpleOneClient,
  params: { tableName: string; id: string; data: object; confirmed?: boolean }
): Promise<unknown> {
  logger.info('Запрос на обновление', { 
    tableName: params.tableName, 
    id: params.id,
    dataKeys: Object.keys(params.data)
  });
  
  if (!params.confirmed) {
    return createConfirmationRequest('update', `${params.tableName}/${params.id}`, params.data);
  }
  
  const result = await client.updateResource(params.tableName, params.id, params.data);
  logger.info('Ресурс обновлён', { tableName: params.tableName, id: params.id });
  
  return { success: true, data: result, meta: { operation: 'esm_update' } };
}

// ❌ Антипаттерн: нет проверки данных
export async function tableUpdateHandler(client, params) {
  if (!params.confirmed) return askConfirm();
  return await client.updateResource(params.tableName, params.id, params.data);
  // нет валидации data, нет логирования dataKeys
}
```

### Удаление (table_delete)

```typescript
// ✅ Паттерн: удаление с предупреждением о необратимости
export async function tableDeleteHandler(
  client: SimpleOneClient,
  params: { tableName: string; id: string; confirmed?: boolean }
): Promise<unknown> {
  logger.info('Запрос на удаление ресурса', { tableName: params.tableName, id: params.id });
  
  if (!params.confirmed) {
    return {
      requiresConfirmation: true,
      confirmation: {
        operation: 'delete',
        resource: `${params.tableName}/${params.id}`,
        description: `Удалить запись из ${params.tableName}?`,
        risk: 'Данные удаляются безвозвратно' // явное предупреждение
      }
    };
  }
  
  await client.deleteResource(params.tableName, params.id);
  logger.info('Ресурс удалён', { tableName: params.tableName, id: params.id });
  
  return { success: true, data: { deleted: true }, meta: { operation: 'esm_delete' } };
}

// ❌ Антипаттерн: нет предупреждения о необратимости
export async function tableDeleteHandler(client, params) {
  if (!params.confirmed) return askConfirm();
  await client.deleteResource(params.tableName, params.id);
  return { deleted: true }; // нет предупреждения "безвозвратно"
}
```

## Работа с ошибками

```typescript
// ✅ Паттерн: обёртка ошибок с контекстом
try {
  const result = await client.createResource(tableName, data);
  logger.info('Ресурс создан', { tableName, result });
} catch (error) {
  const mcpError = toMcpError(error, {
    operation: 'create',
    resourceType: tableName
  });
  logger.error('Ошибка создания ресурса', { tableName, error: mcpError.message });
  throw mcpError;
}

// ❌ Антипаттерн: потеря контекста
try {
  const result = await client.createResource(tableName, data);
} catch (error) {
  throw new Error('Failed to create'); // нет контекста, нет логирования
}
```

## Логирование

```typescript
// ✅ Паттерн: структурированное логирование
logger.info('Чтение ресурса', {
  tableName: params.tableName,
  id: params.id,
  hasQuery: !!params.query,
  queryType: typeof params.query,
  allParams: params
});

// ❌ Антипаттерн: строковое логирование
logger.info(`Reading ${params.tableName} with id ${params.id}`);
```

## Тестирование

```typescript
// ✅ Паттерн: моки с vi.fn()
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tableReadHandler } from '../../tools/table-read';

describe('table_read инструмент', () => {
  let mockClient: Partial<SimpleOneClient>;

  beforeEach(() => {
    mockClient = { readResource: vi.fn() };
  });

  it('должен читать одну запись по ID', async () => {
    const mockData = { id: 'INC001', number: 'INC001' };
    vi.mocked(mockClient.readResource).mockResolvedValue(mockData);

    const result = await tableReadHandler(mockClient as SimpleOneClient, {
      tableName: 'incident',
      id: 'INC001'
    });

    expect(result).toEqual({
      success: true,
      data: [mockData],
      meta: { operation: 'esm_read', tableName: 'incident', count: 1 }
    });
  });
});

// ❌ Антипаттерн: тесты без моков
it('должен читать запись', async () => {
  const result = await tableReadHandler(realClient, { tableName: 'incident', id: 'INC001' });
  expect(result).toBeDefined(); // реальный API, нет изоляции
});
```

## Конфигурация

```typescript
// ✅ Паттерн: валидация конфига через Zod
import { z } from 'zod';

const configSchema = z.object({
  SIMPLEONE_URL: z.string().url(),
  SIMPLEONE_API_KEY: z.string().optional(),
  SIMPLEONE_BASIC_USER: z.string().optional(),
  SIMPLEONE_BASIC_PASSWORD: z.string().optional(),
  SIMPLEONE_TIMEOUT: z.string().transform(Number).default('30000')
}).refine(data => data.SIMPLEONE_API_KEY || (data.SIMPLEONE_BASIC_USER && data.SIMPLEONE_BASIC_PASSWORD), {
  message: 'Требуется API_KEY или Basic Auth'
});

// ❌ Антипаттерн: прямое чтение из process.env
const config = {
  url: process.env.SIMPLEONE_URL,
  apiKey: process.env.SIMPLEONE_API_KEY,
  // нет валидации, нет проверки на наличие auth
};
```
