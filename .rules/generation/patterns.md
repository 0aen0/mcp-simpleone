# Patterns

## MCP Tool Patterns

### 1. Tool Definition
```typescript
// ✅
export const esmReadTool: Tool = {
  name: 'esm_read',
  description: 'Чтение записи из SimpleOne (ESM)',
  inputSchema: {
    type: 'object',
    properties: {
      resourceType: { type: 'string', description: 'Тип ресурса (incident, request, user)' },
      id: { type: 'string', description: 'ID записи (опционально, если нет — список)' }
    },
    required: ['resourceType']
  },
  handler: esmReadHandler
};

// ❌
const readTool = { name: 'read', handler: async (p: any) => {} };
```

### 2. Handler с подтверждением
```typescript
// ✅
async function esmDeleteHandler(params: DeleteParams): Promise<ToolResult> {
  await confirmAction({
    operation: 'delete',
    resource: `${params.resourceType}/${params.id}`,
    risk: 'Данные будут удалены безвозвратно'
  });
  
  await apiClient.delete(`/api/${params.resourceType}/${params.id}`);
  return { success: true, data: { deleted: true } };
}

// ❌
async function deleteHandler(params: any) {
  await fetch(`/api/${params.type}/${params.id}`, { method: 'DELETE' });
}
```

### 3. API Client
```typescript
// ✅
export class SimpleOneClient {
  private baseUrl: string;
  private auth: AuthConfig;
  
  constructor(config: SimpleOneConfig) {
    this.baseUrl = config.baseUrl;
    this.auth = config.auth;
  }
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.buildAuthHeaders()
    });
    
    if (!response.ok) {
      throw new ApiError(`GET_FAILED: ${endpoint}`, response.status);
    }
    
    return response.json();
  }
  
  private buildAuthHeaders(): HeadersInit {
    // API-ключ или Basic Auth
    if (this.auth.apiKey) {
      return { 'X-API-Key': this.auth.apiKey };
    }
    return { 'Authorization': `Basic ${this.auth.basicToken}` };
  }
}

// ❌
const client = {
  get: async (url: string) => fetch(url).then(r => r.json())
};
```

### 4. Config из .env
```typescript
// ✅
export const config = {
  baseUrl: process.env.SIMPLEONE_URL!,
  apiKey: process.env.SIMPLEONE_API_KEY,
  basicUser: process.env.SIMPLEONE_BASIC_USER,
  basicPassword: process.env.SIMPLEONE_BASIC_PASSWORD
};

validateConfig(config);

// ❌
const config = {
  baseUrl: 'https://esm.company.com', // хардкод
  apiKey: 'sk-...' // секрет в коде
};
```

### 5. Error Wrapping
```typescript
// ✅
try {
  await apiClient.create('/api/incident', data);
} catch (error) {
  throw new McpError('ESM_CREATE_FAILED', {
    cause: error,
    operation: 'create',
    resourceType: 'incident'
  });
}

// ❌
try {
  await create(data);
} catch (e) {
  throw new Error('Error');
}
```

## Anti-Patterns

| ❌ Паттерн | ✅ Замена | Почему |
|---|---|---|
| `any` в типах | явный интерфейс | типобезопасность инструментов |
| Хардкод URL/секретов | .env + валидация | безопасность, переносимость |
| Write без подтверждения | confirmAction() | защита от случайных изменений |
| Глубокие импорты `../../../` | абсолютные `@/` | читаемость, рефакторинг |
| Логирование токенов | маскировка `***` | безопасность |
| Один инструмент для всего | 1 инструмент = 1 операция | ясность, тестирование |

## SimpleOne API Patterns

### CRUD Resource
```typescript
// GET /api/{resourceType} — список
// GET /api/{resourceType}/{id} — чтение
// POST /api/{resourceType} — создание
// PATCH /api/{resourceType}/{id} — обновление
// DELETE /api/{resourceType}/{id} — удаление
```

### Run Script
```typescript
// POST /api/script/execute
// Body: { scriptName: string, parameters: Record<string, any> }
```
