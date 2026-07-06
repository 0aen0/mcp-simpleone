# Meta

## Version
**v1.11** — 2026-07-06 (Bearer-аутентификация, Docker-документация)
**Generator:** DEMIURGOS v22.3
**Sizing:** Знания=[M] × Инструменты=[1] × Расширения=[0]
**Context Budget:** модель 128K → бюджет ≤ 38K → текущий ~10K

## Files
| Файл | Назначение | Строк |
|---|---|---|
| `_index.md` | Identity, права, иерария (+ MCP Tools) | ~50 |
| `_meta.md` | Версия, sizing, журнал | ~50 |
| `architecture.md` | Структура, слои, решения (Key Decisions) | ~50 |
| `constraints.md` | Стиль, защита, ограничения | ~80 |
| `patterns.md` | Паттерны + антипаттерны | ~150 |
| `memory.md` | Error traces, решения (append-only) | ~100 |
| `simpleone-project.md` | Правила SimpleOne DSL | ~300 |
| `widgets-design.md` | Виджеты и дизайн-система | ~235 |
| `debug.md` | Протокол отладки правил | ~50 |
| `context/task.md` | Текущая задача | ~30 |
| `generation/output.md` | Контракт вывода | ~50 |
| `generation/patterns.md` | Паттерны вывода | ~100 |
| `quality/eval.md` | Критерии оценки | ~100 |

**Итого:** ~1200 строк ядра

## Журнал изменений
| Дата | Что | Почему |
|---|---|---|
| 2026-07-06 | Ссылки на официальную документацию Table API в README/MCP_SETUP/DEPLOYMENT/AGENTS | docs.simpleone.ru подтверждает Basic/Bearer; добавлена таблица маппинга параметров на `sysparm_*` |
| 2026-07-06 | `SIMPLEONE_API_KEY` шлётся как `Authorization: Bearer` (auth.ts) | Инстанс SimpleOne отвергает `X-API-Key` с 401; токен = auth_key из POST /rest/v1/auth/login |
| 2026-07-06 | Обновлены README, MCP_SETUP, DEPLOYMENT, .env.example | Документирование Bearer-аутентификации и получения токена |
| 2026-07-06 | Docker-документация: сборка Dockerfile + docker-compose.yml.example | Раздел в DEPLOYMENT.md и README; в шаблоне compose включён build-arg `REGISTRY: ${REGISTRY:-}` |
| 2026-03-27 | Обновлена документация проекта | Актуализация README, AGENTS, QWEN, MCP_SETUP, GITHUB_DEPLOYMENT |
| 2026-03-27 | Удалена standalone директория | Генерируется через npm run build:standalone |
| 2026-03-27 | Добавлена переменная `version` из package.json | Версия программы доступна в config, health, info endpoints |
| 2026-03-27 | Удалена CI/CD автоматизация | Проект не использует GitHub Actions |
| 2026-03-27 | Удалён бейдж CI из README.md | CI/CD больше не используется |
| 2026-03-27 | Исправлены тесты логгера | Logger использует правильные console.* методы |
| 2026-03-26 | Добавлена инструкция автономной сборки в README.md | Документирование `npm run build:standalone` |
| 2026-03-26 | Удалены Skills (esm-crud, cli-tools) | Skills не требуются |
| 2026-03-26 | Исправлен AGENTS.md | Удалена ссылка на несуществующие Skills |
| 2026-03-26 | Исправлен .qwen/settings.json | Удалён stdio транспорт (оставлен SSE) |
| 2026-03-26 | Обновлён README.md | Добавлены секции ссылок на документацию |
| 2026-03-26 | DEMIURGOS аудит (обновление) | Сокращение QWEN.md (219→60), удаление core/ |
| 2026-03-26 | QWEN.md сокращён до 60 строк | Удалено дублирование с ядром |
| 2026-03-26 | Добавлены MCP Tools в _index.md | Быстрое обращение к инструментам |
| 2026-03-26 | Обновлён AGENTS.md (+ rtk) | CLI compression документация |
| 2026-03-26 | architecture.md обновлён | Key Decisions из core/ перенесены |
| 2026-03-26 | Удалено core/ (дубликаты) | architecture.md, constraints.md |
| 2026-03-25 | DEMIURGOS аудит (17 пунктов) | 3 файла обновлены (memory.md, architecture.md, patterns.md) |

## Update Policy
- **Ежемесячно:** полный аудит по `_meta.md`
- **Ошибка 2×:** добавить правило в `constraints.md` или `patterns.md`
- **memory.md > 100 строк:** каскад (flush → compaction → summarization)
- **Эффективность < 70%:** Фаза 1-U (эволюционное обновление)
