# Автономная установка MCP-сервера SimpleOne

## 📦 Что это такое

Автономная версия MCP-сервера — это самодостаточный пакет, который можно:
- Скопировать в любой каталог на сервере
- Запустить без установки дополнительных зависимостей
- Использовать в production-окружении

## 🚀 Быстрое развёртывание

### Шаг 1: Сборка (на машине разработчика)

```bash
npm run build:standalone
```

После сборки автономная версия находится в:
```
standalone/mcp-simpleone/
```

### Шаг 2: Копирование

Скопируйте весь каталог `mcp-simpleone` в нужное место:

**Windows:**
```cmd
xcopy /E /I standalone\mcp-simpleone D:\Apps\mcp-simpleone
```

**Linux/macOS:**
```bash
cp -r standalone/mcp-simpleone /opt/apps/mcp-simpleone
```

### Шаг 3: Настройка

```bash
cd /opt/apps/mcp-simpleone
cp .env.example .env
```

Отредактируйте `.env`:
```env
SIMPLEONE_URL=https://your-instance.simpleone.ru
SIMPLEONE_BASIC_USER=your-username
SIMPLEONE_BASIC_PASSWORD=your-password
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Вместо Basic Auth можно задать `SIMPLEONE_API_KEY` — токен SimpleOne
(`auth_key` из `POST /rest/v1/auth/login`), сервер отправит его заголовком
`Authorization: Bearer`. При заданных обоих вариантах приоритет у токена.
Оба способа авторизации описаны в [документации Table API](https://docs.simpleone.ru/platform/developer/integration/rest-api/table-api).

### Шаг 4: Запуск

**Проверка работы:**
```bash
npm start -- --help
```

**Запуск в режиме stdio (для Qwen Code):**
```bash
npm start
```

**Запуск в режиме SSE:**
```bash
npm run start:sse
```

## 🐳 Развёртывание в Docker

Альтернатива автономному пакету — контейнер. В репозитории есть `Dockerfile`
(двухэтапная сборка) и шаблон `docker-compose.yml.example`.

### Как устроена сборка (Dockerfile)

Сборка идёт в два этапа от образа `node:20-slim`:

| Этап | Что делает |
|---|---|
| **builder** | `npm ci` со всеми зависимостями (dev нужны для `tsc`), копирует `src/` и собирает TypeScript в `dist/` |
| **runtime** | `NODE_ENV=production`, ставит только prod-зависимости (`npm ci --omit=dev`), забирает готовый `dist/` из builder |

Итоговый образ не содержит исходников, dev-зависимостей и компилятора.
Особенности runtime-этапа:

- `package.json` копируется в образ — он читается в рантайме из `dist/config.js` (версия сервера);
- процесс работает от непривилегированного пользователя `node`;
- каталог `/app/logs` создан заранее (для `LOG_OUTPUT=file|both`);
- `HEALTHCHECK` опрашивает `GET /health` каждые 30 с;
- `CMD` по умолчанию запускает HTTP/SSE транспорт на порту 3000; для stdio-режима переопределите команду: `["node","dist/index.js"]`.

**Аргументы сборки:**

| ARG | По умолчанию | Назначение |
|---|---|---|
| `REGISTRY` | пусто (Docker Hub) | Хост кеширующего зеркала реестра, **со слешем на конце** |
| `NODE_TAG` | `20-slim` | Тег базового образа Node.js |

```bash
# Обычная сборка
docker build -t mcp-simpleone .

# Через зеркало реестра
docker build --build-arg REGISTRY=your-mirror.example.com/ -t mcp-simpleone .

# Запуск (конфигурация — из .env, см. .env.example)
docker run -d --name mcp-simpleone --env-file .env -p 3000:3000 mcp-simpleone
```

### Docker Compose

```bash
cp docker-compose.yml.example docker-compose.yml
cp .env.example .env   # и заполните аутентификацию
docker compose up -d --build

# Проверка
docker compose ps                      # healthcheck: healthy
curl http://localhost:3000/health
```

Переменные окружения compose-файла (задаются в shell или в `.env`):

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `REGISTRY` | пусто | Зеркало реестра для сборки (со слешем) |
| `NODE_TAG` | `20-slim` | Тег базового образа |
| `HOST_PORT` | `3000` | Порт, публикуемый на хосте (внутри контейнера всегда 3000) |

Настройки SimpleOne (URL, `SIMPLEONE_API_KEY` или Basic Auth) контейнер
получает из `.env` через `env_file`. Каталог `./logs` монтируется в
`/app/logs` — файловые логи переживают пересоздание контейнера.

## 🔧 Подключение к Qwen Code

Добавьте в настройки MCP-серверов (`%USERPROFILE%\.qwen\settings.json` или `~/.qwen/settings.json`):

```json
{
  "mcpServers": {
    "simpleone": {
      "command": "node",
      "args": ["D:\\Apps\\mcp-simpleone\\dist\\index.js"],
      "env": {
        "SIMPLEONE_URL": "https://your-instance.simpleone.ru",
        "SIMPLEONE_BASIC_USER": "your-username",
        "SIMPLEONE_BASIC_PASSWORD": "your-password"
      }
    }
  }
}
```

## 📁 Структура автономного пакета

```
mcp-simpleone/
├── dist/              # Скомпилированный код
│   ├── index.js       # Точка входа
│   └── *.js           # Остальные модули
├── node_modules/      # Зависимости (production only)
├── package.json       # Конфигурация npm
├── package-lock.json  # Заблокированные версии
├── .env.example       # Шаблон конфигурации
├── .env               # Ваша конфигурация (создаётся вручную)
├── LICENSE            # Лицензия
└── README.md          # Краткая инструкция
```

## 🔐 Безопасность

1. **Файл `.env`** содержит чувствительные данные:
   - Установите права доступа только для чтения (chmod 600 на Linux)
   - Не включайте `.env` в системы контроля версий

2. **NODE_TLS_REJECT_UNAUTHORIZED=0**:
   - Используйте только в тестовых окружениях
   - В production настройте правильные SSL-сертификаты

## 🛠 Обновление

Для обновления автономной версии:

```bash
# 1. Пересоберите автономную версию
npm run build:standalone

# 2. Остановите работающий сервер

# 3. Замените каталог на сервере
rm -rf /opt/apps/mcp-simpleone
cp -r standalone/mcp-simpleone /opt/apps/mcp-simpleone

# 4. Сохраните .env (не перезаписывайте!)
# 5. Запустите сервер
```

## ⚠️ Важные замечания

1. **Node.js >= 20.0.0** должен быть установлен в системе
2. **Не удаляйте `node_modules`** — без них сервер не запустится
3. **Сохраняйте `.env`** при обновлении — там ваши настройки
4. **Проверьте права доступа** к каталогу с сервером

## 🐛 Решение проблем

### Ошибка: "Cannot find module..."
Проверьте, что `node_modules` существует и содержит пакеты.

### Ошибка: "EADDRINUSE"
Порт 3000 занят. Запустите с другим портом:
```bash
PORT=3001 npm run start:sse
```

### Ошибка подключения к SimpleOne
Проверьте `.env` и сетевую доступность сервера SimpleOne.

## 📞 Поддержка

Документация: [README.md](./README.md)  
Исходный код: [GitHub Repository](https://github.com/0aen0/mcp-simpleone)
