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
