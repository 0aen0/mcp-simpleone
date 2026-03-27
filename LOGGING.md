# Настраиваемое логирование

## Уровни логирования

MCP-сервер поддерживает 5 уровней логирования (от самого подробного к самому критичному):

| Уровень | Описание | Когда использовать |
|---|---|---|
| `trace` | Трассировка | Детальная отладка внутренних процессов, HTTP запросы/ответы |
| `debug` | Отладка | Отладочная информация для разработчиков |
| `info` | Информация | Общие события (запуск сервера, вызов инструментов) |
| `warn` | Предупреждение | Потенциальные проблемы (требуется подтверждение операции) |
| `error` | Ошибка | Критические ошибки (сбои API, исключения) |

## Настройка

### Переменные окружения

#### `LOG_LEVEL` — уровень логирования

Установите переменную окружения `.env`:

```bash
# Самый подробный уровень (все логи)
LOG_LEVEL=trace

# Отладочный уровень
LOG_LEVEL=debug

# Информационный уровень (по умолчанию)
LOG_LEVEL=info

# Только предупреждения и ошибки
LOG_LEVEL=warn

# Только ошибки
LOG_LEVEL=error
```

#### `LOG_OUTPUT` — вывод логов

Настройте куда будут записываться логи:

```bash
# Вывод только в stdout (консоль) — по умолчанию
LOG_OUTPUT=stdout

# Вывод только в файл
LOG_OUTPUT=file

# Вывод и в stdout и в файл одновременно
LOG_OUTPUT=both
```

#### `LOG_FILE` — путь к файлу логов

Путь к файлу для записи логов (используется при `LOG_OUTPUT=file` или `LOG_OUTPUT=both`):

```bash
# Путь по умолчанию: ./logs/mcp-simpleone.log
LOG_FILE=./logs/mcp-simpleone.log

# Кастомный путь
LOG_FILE=/var/log/mcp-simpleone/server.log
```

### Примеры использования

**Разработка (подробное логирование в stdout):**
```bash
LOG_LEVEL=trace
npm run dev
```

**Production (минимальное логирование в файл):**
```bash
LOG_LEVEL=error
LOG_OUTPUT=file
npm start
```

**Отладка проблем (логи в файл и консоль):**
```bash
LOG_LEVEL=debug
LOG_OUTPUT=both
LOG_FILE=./debug.log
npm run dev:sse
```

**Автотесты (только ошибки в консоль):**
```bash
LOG_LEVEL=error
LOG_OUTPUT=stdout
npm test
```

## Формат логов

Каждое сообщение лога имеет формат:

```
[TIMESTAMP] [PREFIX] [LEVEL ] MESSAGE DATA
```

Пример:
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [TRACE] GET запрос {"endpoint":"/incident","params":{"sysparm_limit":"10"}}
[2026-03-26T12:00:00.100Z] [SimpleOneMCP] [TRACE] GET ответ {"endpoint":"/incident","status":200}
[2026-03-26T12:00:00.200Z] [SimpleOneMCP] [INFO ] Чтение ресурса {"tableName":"incident","count":10}
[2026-03-26T12:00:00.300Z] [SimpleOneMCP] [WARN ] Требуется подтверждение операции создания
[2026-03-26T12:00:00.400Z] [SimpleOneMCP] [ERROR] Ошибка создания ресурса {"tableName":"incident","error":"API error"}
```

## Маскировка чувствительных данных

Логгер автоматически маскирует чувствительные данные:

- **Пароли:** `password`, `passwd`, `pwd`
- **API ключи:** `apiKey`, `api_key`, `apikey`, `token`, `secret`
- **Авторизация:** `authorization`

Пример:
```javascript
logger.debug('Запрос', { 
  user: 'admin', 
  password: 'secret123',  // Будет заменено на '***'
  apiKey: 'long-secret-key'  // Будет заменено на '***'
});
```

Вывод:
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [DEBUG] Запрос {"user":"admin","password":"***","apiKey":"***"}
```

## Динамическое изменение уровня

Уровень логирования можно изменить динамически через API логгера:

```typescript
import { logger } from './utils/logger.js';

// Получить текущий уровень
console.log(logger.getLevel()); // 'info'

// Изменить уровень
logger.setLevel('debug');

// Теперь будут выводиться debug сообщения
logger.debug('Отладочное сообщение');
```

## Что логируется

### API клиент (`src/api/client.ts`)

**Уровень `trace`:**
- Все HTTP запросы (GET, POST, PATCH, PUT, DELETE)
- Параметры запросов
- Ответы сервера (статус коды)

**Уровень `error`:**
- Ошибки HTTP запросов

### Инструменты (`src/tools/*.ts`)

**Уровень `info`:**
- Вызов инструментов
- Результаты операций (создание, чтение, обновление, удаление)
- Статус подтверждения операций

**Уровень `warn`:**
- Требуется подтверждение операции

**Уровень `error`:**
- Ошибки выполнения операций

### Сервер (`src/index-*.ts`)

**Уровень `info`:**
- Запуск сервера
- Конфигурация (без секретов)
- Запрос списка инструментов
- Вызов инструментов

## Рекомендации

### Разработка
```bash
LOG_LEVEL=debug
```
Позволяет видеть все события и отладочную информацию.

### Отладка проблем с API
```bash
LOG_LEVEL=trace
```
Показывает все HTTP запросы и ответы для детальной диагностики.

### Production
```bash
LOG_LEVEL=warn
```
Только предупреждения и ошибки для минимизации объёма логов.

### CI/CD
```bash
LOG_LEVEL=error
```
Только критические ошибки для чистоты вывода.

## Примеры вывода

### TRACE уровень
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [TRACE] GET запрос {"endpoint":"/rest/v1/table/incident","params":{"sysparm_limit":"10"},"url":"https://example.com/rest/v1/table/incident?sysparm_limit=10"}
[2026-03-26T12:00:00.100Z] [SimpleOneMCP] [TRACE] GET ответ {"endpoint":"/rest/v1/table/incident","status":200}
```

### DEBUG уровень
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [DEBUG] Конфигурация загружена {"simpleOneUrl":"https://***","timeout":30000}
```

### INFO уровень
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [INFO ] Запуск SimpleOne MCP-сервера (SSE режим)
[2026-03-26T12:00:00.100Z] [SimpleOneMCP] [INFO ] Вызов инструмента {"name":"table_read","hasArgs":true}
[2026-03-26T12:00:00.200Z] [SimpleOneMCP] [INFO ] Ресурс прочитан {"tableName":"incident","count":10}
```

### WARN уровень
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [WARN ] Требуется подтверждение операции создания
```

### ERROR уровень
```
[2026-03-26T12:00:00.000Z] [SimpleOneMCP] [ERROR] Ошибка создания ресурса {"tableName":"incident","error":"API connection failed"}
```
