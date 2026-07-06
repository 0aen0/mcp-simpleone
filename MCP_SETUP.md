# Подключение к MCP-серверу SimpleOne

## Быстрый старт

### 1. Сборка

```bash
npm run build
```

### 2. Запуск сервера

**Режим разработки (SSE):**
```bash
npm run dev:sse
# или
npm run dev:http
```

**Режим продакшна (SSE):**
```bash
npm run start:http
```

**Режим STDIO (для локальных MCP-клиентов):**
```bash
npm run dev
# или
npm start
```

### 3. Проверка

```bash
# Health check
curl http://localhost:3000/health

# Список инструментов
curl http://localhost:3000/info

# SSE подключение
curl -N http://localhost:3000/sse
```

---

## Настройка для Qwen Code

**Файл:** `.qwen/settings.json`

```json
{
  "mcpServers": {
    "simpleone": {
      "type": "sse",
      "url": "http://localhost:3000/sse",
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    }
  }
}
```

**Глобально (Windows):** `%USERPROFILE%\.qwen\settings.json`
**Глобально (macOS/Linux):** `~/.qwen/settings.json`
**Для проекта:** `.qwen/settings.json` в корне проекта

---

## Настройка для других MCP-клиентов

### Claude Code

**Файл:** `~/.claude/settings.json` или `.claude/settings.json`

```json
{
  "mcpServers": {
    "simpleone": {
      "command": "node",
      "args": ["path/to/mcp-simpleone/dist/index.js"],
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password"
      }
    }
  }
}
```

### Cursor

**Файл:** `.cursor/mcp.json` или настройки Cursor

```json
{
  "mcp": {
    "simpleone": {
      "command": "node",
      "args": ["path/to/mcp-simpleone/dist/index.js"],
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password"
      }
    }
  }
}
```

### Windsurf

**Файл:** `.windsurf/mcp.json`

```json
{
  "servers": {
    "simpleone": {
      "command": "node",
      "args": ["path/to/mcp-simpleone/dist/index.js"],
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password"
      }
    }
  }
}
```

### GitHub Copilot

**Файл:** `.github/copilot-mcp.json`

```json
{
  "mcpServers": {
    "simpleone": {
      "command": "node",
      "args": ["path/to/mcp-simpleone/dist/index.js"],
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password"
      }
    }
  }
}
```

---

## Переменные окружения

| Переменная | Описание | Пример |
|---|---|---|
| `SIMPLEONE_URL` | URL SimpleOne (ESM) | `https://your-instance.simpleone.ru` |
| `SIMPLEONE_API_KEY` | Токен SimpleOne — `auth_key` из `POST /rest/v1/auth/login`, отправляется как `Authorization: Bearer` (вариант 1, приоритетнее Basic Auth) | `your-auth-token` |
| `SIMPLEONE_BASIC_USER` | Пользователь Basic Auth (вариант 2) | `your-username` |
| `SIMPLEONE_BASIC_PASSWORD` | Пароль Basic Auth (вариант 2) | `your-password` |
| `SIMPLEONE_TIMEOUT` | Таймаут запросов (мс) | `30000` |
| `SIMPLEONE_AUTO_CONFIRM` | Отключить подтверждения (только для автоматизации!) | `false` |
| `MCP_PORT` | Порт для SSE транспорта | `3000` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Для self-signed сертификатов | `0` |
| `LOG_LEVEL` | Уровень логирования | `info` |
| `LOG_OUTPUTL` | Вывод логов | `stdout` |
| `LOG_FILE` | Путь к файлу логов (используется при LOG_OUTPUT=file или both) | `./logs/mcp-simpleone.log` |

Способы авторизации (Basic Auth / Bearer Token) и параметры запросов описаны в
[официальной документации Table API](https://docs.simpleone.ru/platform/developer/integration/rest-api/table-api).

**Пример `.env`:**
```bash
# SimpleOne (ESM) URL
SIMPLEONE_URL=https://your-instance.simpleone.ru

# Аутентификация (выберите один вариант; при обоих приоритет у API-ключа)

# Вариант 1: токен (auth_key из POST /rest/v1/auth/login, шлётся как Bearer)
#SIMPLEONE_API_KEY=your-auth-token-here

# Вариант 2: Basic Auth
SIMPLEONE_BASIC_USER=your-username
SIMPLEONE_BASIC_PASSWORD=your-password

# Опционально
SIMPLEONE_TIMEOUT=30000
MCP_PORT=3000

# Для самоподписанных сертификатов
NODE_TLS_REJECT_UNAUTHORIZED=0

# Для автоматизации (отключает подтверждения — опасно!)
# SIMPLEONE_AUTO_CONFIRM=false
```

---

## Доступные инструменты

| Инструмент | Описание | Подтверждение |
|---|---|---|
| `table_read` | Чтение записи по ID или списка | ❌ Не требуется |
| `table_create` | Создание новой записи | ✅ Требуется (отключается через `SIMPLEONE_AUTO_CONFIRM=true`) |
| `table_update` | Обновление записи | ✅ Требуется (отключается через `SIMPLEONE_AUTO_CONFIRM=true`) |
| `table_delete` | Удаление записи | ✅ Требуется (отключается через `SIMPLEONE_AUTO_CONFIRM=true`) |

---

## Примеры использования

### Чтение данных (без подтверждения)

**Базовый запрос:**
```
Вызови table_read с tableName="sys_db_table"
```
**Результат:** JSON со списком таблиц

**С фильтрами и параметрами:**
```
Вызови table_read с tableName="itsm_incident", query="active=1^priority=1", limit=10, fields="number,description,state"
```
**Результат:** Список активных инцидентов с высоким приоритетом

**С пагинацией и no_count:**
```
Вызови table_read с tableName="itsm_incident", query="active=1", limit=50, page=2, no_count=true
```
**Результат:** Вторая страница по 50 записей без подсчёта общего количества

**С dot-walking:**
```
Вызови table_read с tableName="task", query="assigned_user.department=IT", fields="number,assigned_user.name"
```
**Результат:** Задачи с полями из связанной таблицы пользователя

### Создание записи (с подтверждением)

```
Вызови table_create с tableName="task", data={"subject": "Задача"}
```
**Результат:** Запрос подтверждения → после OK → задача создана

### Обновление записи (с подтверждением)

```
Вызови table_update с tableName="task", id="177431367402911371", data={"subject": "Новая тема"}
```
**Результат:** Запрос подтверждения → после OK → запись обновлена

### Удаление записи (с подтверждением)

```
Вызови table_delete с tableName="task", id="177431367402911371"
```
**Результат:** Запрос подтверждения → после OK → запись удалена

## Поддерживаемые операторы query

| Оператор | Описание | Пример |
|---|---|---|
| `=` | Равно | `active=1` |
| `!=` | Не равно | `state!=closed` |
| `>`, `<`, `>=`, `<=` | Числовые сравнения | `priority>=2` |
| `LIKE` | Содержит | `subjectLIKEзадача` |
| `IN` | В списке | `priorityIN1,2,3` |
| `ISEMPTY` | Пустое | `assigned_userISEMPTY` |
| `ISNOTEMPTY` | Не пустое | `callerISNOTEMPTY` |
| `CHANGESTO` | Изменилось на | `stateCHANGESTO5` |
| `CHANGES` | Изменилось | `stateCHANGES` |
| `^` | И (AND) | `active=1^priority=2` |
| `^OR` | ИЛИ (OR) | `state=new^ORstate=in_progress` |
| `DYNAMIC` | Динамический фильтр | `assigned_toDYNAMIC156957117519820256` |

**Dot-walking:** Поддерживается (например: `assigned_user.department=IT`)

### Ошибка: "unable to verify the first certificate"

**Причина:** Self-signed сертификат  
**Решение:** Добавьте в `.env`:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Ошибка: "Connection refused"

**Причина:** Сервер не запущен  
**Решение:**
```bash
npm run dev:sse
# Проверка
curl http://localhost:3000/health
```

### Ошибка: "401 Unauthorized"

**Причина:** Неверные учётные данные  
**Решение:** Проверьте `.env`:
```bash
SIMPLEONE_BASIC_USER=your-username
SIMPLEONE_BASIC_PASSWORD=правильный-пароль
```

### Ошибка: "404 Not Found"

**Причина:** Неправильный URL  
**Решение:** URL должен быть базовым, без пути `/rest/v1/table/`:
```bash
# ✅ Правильно
SIMPLEONE_URL=https://your-instance.simpleone.ru

# ❌ Неправильно
SIMPLEONE_URL=https://your-instance.simpleone.ru/rest/v1/table/
```

---

## Тестирование подключения

```bash
# 1. Health check
curl http://localhost:3000/health
# Ожидается: {"status":"ok","name":"mcp-simpleone","version":"1.0.0","sessions":0}

# 2. Список инструментов
curl http://localhost:3000/info
# Ожидается: список из 4 инструментов (table_create, table_read, table_update, table_delete)

# 3. SSE подключение
curl -N http://localhost:3000/sse
# Ожидается: SSE event stream

## Тесты

**Всего тестов:** 40 ✅
- 8 тестов на параметры (display_value, exclude_reference_link, page, no_count, view)
- 10 тестов на операторы query (!=, >, <, IN, ISNOTEMPTY, CHANGESTO, CHANGES)
- 3 теста на dot-walking
- 2 теста на putResource
- 17 тестов на CRUD операции
```

---

## Мониторинг

**Логирование:** Сервер логирует все операции в консоль  
**Сессии:** `/health` показывает количество активных сессий  
**Инструменты:** `/info` показывает доступные инструменты

**Пример лога:**
```
[2026-03-24T15:21:03.570Z] [SimpleOneMCP] [INFO] Чтение ресурса {"tableName":"incident","id":"INC001"}
[2026-03-24T15:21:03.575Z] [SimpleOneMCP] [INFO] Ресурс прочитан {"tableName":"incident","count":1}
```
