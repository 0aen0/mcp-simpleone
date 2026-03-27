# Output Contract

## Формат ответов

### Структура ответа
1. **Краткое резюме** (1-2 строки)
2. **Действия** (что сделано / будет сделано)
3. **Артефакты** (файлы, команды, следующий шаг)

### Таблицы > списки > сплошной текст

## MCP Tool Response Format

### Успешный ответ
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "operation": "esm_read",
    "resourceType": "incident",
    "timestamp": "2026-03-24T10:00:00Z"
  }
}
```

### Ошибка
```json
{
  "success": false,
  "error": {
    "code": "ESM_READ_FAILED",
    "message": "Не удалось прочитать инцидент INC001",
    "details": {
      "cause": "404 Not Found",
      "operation": "read",
      "resourceType": "incident"
    }
  }
}
```

### Требуется подтверждение
```json
{
  "requiresConfirmation": true,
  "confirmation": {
    "operation": "esm_delete",
    "resource": "incident/INC001",
    "description": "Удаление инцидента INC001",
    "risk": "Данные будут удалены безвозвратно"
  }
}
```

## Agent Behavior

### При запросе операции
1. **Read:** выполнить сразу → вернуть данные
2. **Write:** запросить подтверждение → выполнить после OK

### При ошибке
1. Обернуть ошибку с контекстом
2. Предложить решение (повторить / проверить конфиг / изменить параметры)

### При нехватке данных
1. Спросить **один вопрос** с вариантами
2. Если не отвечает → безопасное значение по умолчанию с `<!-- DEFAULT: причина -->`

## Стиль кода

### Snippet ✅
```typescript
export interface McpToolResult<T> {
  success: true;
  data: T;
  meta: ToolMeta;
}
```

### Snippet ❌
```typescript
type Result = any; // ❌ нет типизации
```
