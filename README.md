# SimpleOne MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

MCP-сервер для интеграции с SimpleOne (ESM) через REST API. Позволяет ИИ-агентам выполнять CRUD-операции в ESM-системе.

## Быстрый старт

### Установка

```bash
npm install
```

### Настройка

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Заполните конфигурацию:
```env
SIMPLEONE_URL=https://your-instance.simpleone.ru
SIMPLEONE_API_KEY=your-api-key-here
```

Или используйте Basic Auth:
```env
SIMPLEONE_URL=https://your-instance.simpleone.ru
SIMPLEONE_BASIC_USER=your-username
SIMPLEONE_BASIC_PASSWORD=your-password
```

## Запуск

### Разработка (stdio - для MCP-клиентов)
```bash
npm run dev
```

### Разработка (HTTP/SSE - для отладки)
```bash
npm run dev:http    # SSE на порту 3000
npm run dev:sse     # то же самое
```

### Продакшн
```bash
npm run build
npm start           # stdio режим
npm run start:http  # SSE режим на порту 3000
```

## Сетевой доступ (SSE)

Для отладки и тестирования доступен HTTP/SSE транспорт:

**Endpoints:**
- `GET /sse` — SSE подключение
- `POST /message?sessionId=xxx` — отправка сообщений
- `GET /health` — проверка здоровья
- `GET /info` — информация о сервере и инструментах

**Порт:** 3000 (по умолчанию) или через `MCP_PORT` в .env

**Пример:**
```bash
# Запуск в режиме SSE
npm run dev:http

# Проверка
curl http://localhost:3000/health
curl http://localhost:3000/info
```

## Инструменты

| Tool | Описание | Подтверждение | Статус |
|---|---|---|---|
| `table_create` | Создание записи | ✅ Требуется | ✅ Работает |
| `table_read` | Чтение (ID или список) | ❌ Не требуется | ✅ Работает |
| `table_update` | Обновление записи | ✅ Требуется | ✅ Работает |
| `table_delete` | Удаление записи | ✅ Требуется | ✅ Работает |

## Параметры API

### table_read

| Параметр | Тип | Описание |
|---|---|---|
| `tableName` | string | Имя таблицы (обязательно) |
| `id` | string | ID записи (опционально) |
| `query` | string | Фильтр (например, `"active=1^priority=2"`) |
| `limit` | number | Макс. количество записей (по умолчанию 20) |
| `page` | number | Номер страницы (по умолчанию 1) |
| `no_count` | boolean | Отключить подсчёт записей (для оптимизации) |
| `display_value` | string | Возвращать отображаемые значения (`true/false/1/0`) |
| `exclude_reference_link` | boolean | Исключить ссылки для ссылочных полей |
| `fields` | string | Список полей через запятую (например, `"number,caller"`) |
| `view` | string | Представление формы для фильтрации полей |

### table_create

| Параметр | Тип | Описание |
|---|---|---|
| `tableName` | string | Имя таблицы (обязательно) |
| `data` | object | Данные для создания (обязательно) |
| `confirmed` | boolean | Флаг подтверждения |
| `display_value` | string | Возвращать отображаемые значения |
| `exclude_reference_link` | boolean | Исключить ссылки |
| `fields` | string | Список возвращаемых полей |
| `view` | string | Представление формы |

### table_update

| Параметр | Тип | Описание |
|---|---|---|
| `tableName` | string | Имя таблицы (обязательно) |
| `id` | string | ID записи (обязательно) |
| `data` | object | Данные для обновления (обязательно) |
| `confirmed` | boolean | Флаг подтверждения |
| `display_value` | string | Возвращать отображаемые значения |
| `exclude_reference_link` | boolean | Исключить ссылки |
| `fields` | string | Список возвращаемых полей |
| `view` | string | Представление формы |

## Примеры использования

### Чтение данных (без подтверждения)

**Базовый запрос:**
```
Вызови table_read с tableName="itsm_incident"
```

**С фильтрами и параметрами:**
```
Вызови table_read с tableName="itsm_incident", query="active=1^priority=1", limit=10, fields="number,description,state"
```

**Результат:** Список активных инцидентов с высоким приоритетом (макс. 10 записей).

**С отображаемыми значениями:**
```
Вызови table_read с tableName="task", id="177431367402911371", display_value="true"
```

**Результат:** Задача с отображаемыми значениями полей (например, имя пользователя вместо ID).

**С пагинацией и no_count:**
```
Вызови table_read с tableName="itsm_incident", query="active=1", limit=50, page=2, no_count=true
```

**Результат:** Вторая страница по 50 записей без подсчёта общего количества (оптимизация).

**С dot-walking (связанные поля):**
```
Вызови table_read с tableName="task", query="assigned_user.department=IT", fields="number,assigned_user.name,assigned_user.email"
```

**Результат:** Задачи с полями из связанной таблицы пользователя.

### Создание записи (с подтверждением)

**Базовый запрос:**
```
Вызови table_create с tableName="task", data={"subject": "Задача"}
```

**С параметрами:**
```
Вызови table_create с tableName="task", data={"subject": "Задача"}, fields="number,subject,sys_id"
```

**Результат:** Запрос подтверждения → после OK → задача создана с указанными полями в ответе.

### Обновление записи (с подтверждением)

**Базовый запрос:**
```
Вызови table_update с tableName="task", id="177431367402911371", data={"subject": "Новая тема"}
```

**С параметрами:**
```
Вызови table_update с tableName="task", id="177431367402911371", data={"state": "2"}, display_value="true", fields="number,state"
```

**Результат:** Запрос подтверждения → после OK → запись обновлена.

### Удаление записи (с подтверждением)

```
Вызови table_delete с tableName="task", id="177431367402911371"
```

**Результат:** Запрос подтверждения → после OK → запись удалена.

## Тестирование

### Дата: 2026-03-25

| Инструмент | Тест | Результат |
|---|---|---|
| `table_read` | Чтение `sys_db_table` | ✅ JSON со списком таблиц |
| `table_create` | Создание `task` | ✅ TSK0000003 создан |
| `table_update` | Обновление `task` | ✅ Тема обновлена |
| `table_delete` | Удаление `task` | ✅ TSK0000003 удалён |
| `table_read` | Параметры (display_value, page, no_count) | ✅ 8 тестов |
| `table_read` | Операторы query (!=, >, <, IN) | ✅ 10 тестов |
| `table_read` | Dot-walking | ✅ 3 теста |
| `putResource` | Полное обновление (PUT) | ✅ 2 теста |

**Всего тестов:** 40 ✅

### Конфигурация

```env
SIMPLEONE_URL=https://your-instance.simpleone.ru
SIMPLEONE_BASIC_USER=your-username
SIMPLEONE_BASIC_PASSWORD=***
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### API Endpoint

```
https://your-instance.simpleone.ru/rest/v1/table/{tableName}
https://your-instance.simpleone.ru/rest/v1/table/{tableName}/{sys_id}
```

### Поддерживаемые операторы query

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

**Dot-walking:** Поддерживается в `query` и `fields` (например: `assigned_user.department=IT`)

### Проверка работы

```bash
# Health check
curl http://localhost:3000/health

# Info (список инструментов)
curl http://localhost:3000/info

# SSE подключение (для отладки)
curl -N http://localhost:3000/sse
```

## Примеры использования

### Создать инцидент
```
User: Создай инцидент с темой "Тестовая проблема"
Agent: [запросит подтверждение]
User: OK
Agent: INC001 создан
```

### Прочитать список
```
User: Покажи последние инциденты
Agent: [вызовет esm_read без ID]
```

### Обновить статус
```
User: Обнови статус INC001 на "В работе"
Agent: [запросит подтверждение]
User: OK
Agent: Статус обновлён
```

## Безопасность

- **Все write-операции требуют подтверждения** — создание, обновление, удаление
- **Секреты только в .env** — никогда не храните в коде
- **Маскировка в логах** — API-ключи и пароли не логируются

## Тестирование

```bash
npm test              # Запуск всех тестов
npm run test:watch    # Режим наблюдения
npm run test:coverage # Покрытие кода
```

## Линтер

```bash
npm run lint
```

## Автономная версия

Для развёртывания MCP-сервера на других машинах без зависимостей от репозитория:

### Сборка

```bash
npm run build:standalone
```

**Что делает скрипт:**
1. Собирает TypeScript (`npm run build`)
2. Копирует `dist/` в `standalone/mcp-simpleone/`
3. Устанавливает production-зависимости (`node_modules/`)
4. Копирует `.env.example`, `README.md`, `LICENSE`

**Время сборки:** ~15 секунд

### Структура автономной версии

```
standalone/mcp-simpleone/
├── dist/              # Скомпилированный код
├── node_modules/      # Зависимости (production only)
├── package.json       # Минимальный package.json
├── .env.example       # Шаблон конфигурации
├── README.md          # Краткая инструкция
└── LICENSE            # Лицензия
```

**Размер:** ~2.5 MB (131 пакет)

### Развёртывание

```bash
# 1. Скопируйте каталог в нужное место
cp -r standalone/mcp-simpleone /opt/apps/mcp-simpleone

# 2. Настройте
cd /opt/apps/mcp-simpleone
cp .env.example .env
# Отредактируйте .env (SIMPLEONE_URL, SIMPLEONE_BASIC_USER, SIMPLEONE_BASIC_PASSWORD)

# 3. Запустите
npm start           # stdio (для MCP-клиентов)
npm run start:sse   # SSE на порту 3000
npm run start:http  # HTTP на порту 3000
```

### Проверка

```bash
# Health check
curl http://localhost:3000/health

# Информация о сервере
curl http://localhost:3000/info
```

### Обновление автономной версии

```bash
# В исходном репозитории
npm run build:standalone

# Замените каталог на сервере
rm -rf /opt/apps/mcp-simpleone
cp -r standalone/mcp-simpleone /opt/apps/mcp-simpleone

# Сохраните .env (не перезаписывайте!)
# Запустите сервер
cd /opt/apps/mcp-simpleone
npm start
```

→ Подробнее: [DEPLOYMENT.md](DEPLOYMENT.md)

## Структура проекта

```
mcp-simpleone/
├── src/
│   ├── index.ts           # Точка входа
│   ├── config.ts          # Конфигурация и валидация
│   ├── api/
│   │   ├── client.ts      # HTTP клиент
│   │   ├── auth.ts        # Аутентификация
│   │   └── types.ts       # Типы ресурсов
│   ├── tools/
│   │   ├── index.ts       # Регистрация инструментов
│   │   ├── table-create.ts
│   │   ├── table-read.ts
│   │   ├── table-update.ts
│   │   └── table-delete.ts
│   ├── utils/
│   │   ├── confirm.ts     # Подтверждение операций
│   │   ├── errors.ts      # Классы ошибок
│   │   └── logger.ts      # Логирование
│   └── tests/
├── .rules/                # Правила для ИИ-агента
├── AGENTS.md              # Центральный адаптер
└── QWEN.md                # Адаптер для Qwen Code
```

## Ссылки

### Документация
- [MCP_SETUP.md](MCP_SETUP.md) — подробная инструкция по подключению MCP-клиентов
- [DEPLOYMENT.md](DEPLOYMENT.md) — развёртывание и автономная установка
- [LOGGING.md](LOGGING.md) — настройка логирования
- [QUERY_EXAMPLES.md](QUERY_EXAMPLES.md) — примеры query-параметров

### Правила и адаптеры
- `.rules/` — ядро правил для ИИ-агентов (Source of Truth)
- [AGENTS.md](AGENTS.md) — центральный адаптер
- [QWEN.md](QWEN.md) — адаптер для Qwen Code

## Лицензия

MIT — см. [LICENSE](LICENSE) файл.
