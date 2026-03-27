# Примеры query-параметров для тестирования SimpleOne

## Формат Encoded Query

SimpleOne использует специальный формат кодирования условий фильтрации:
- **Разделитель условий И**: `^` (каретка)
- **Разделитель ИЛИ**: `^OR`
- **Всё выражение в скобках**: `(условие)`

---

## 1. Базовые операторы сравнения

### Равно (`=`)
```
active=1
state=new
priority=1
category=hardware
```

### Не равно (`!=`)
```
active!=0
state!=closed
priority!=3
```

### Больше/меньше (`>`, `<`, `>=`, `<=`)
```
priority>2
priority>=1
sys_created_at>2024-01-01
sys_created_at>=2024-01-01
sys_created_at<2024-12-31
sys_created_at<=2024-12-31
```

---

## 2. Проверка на пустоту

### Поле пусто (`ISEMPTY`)
```
assigned_toISEMPTY
descriptionISEMPTY
resolved_atISEMPTY
```

### Поле не пусто (`ISNOTEMPTY`)
```
assigned_toISNOTEMPTY
descriptionISNOTEMPTY
resolved_atISNOTEMPTY
```

---

## 3. Логические операторы

### И (все условия должны выполняться)
```
active=1^priority=1
state=new^assigned_toISNOTEMPTY
category=hardware^priority>=2^active=1
```

### ИЛИ (хотя бы одно условие)
```
state=new^ORstate=in_progress
priority=1^ORpriority=2
assigned_toISEMPTY^ORassigned_to=some_user_id
```

### Комбинированные условия
```
(active=1^priority=1)^OR(active=1^state=new)
state=new^OR(state=in_progress^priority>=2)
(assigned_toISEMPTY^ORassigned_to=some_id)^ORstate=resolved
```

---

## 4. Изменения значений

### Поле изменилось на конкретное значение (`CHANGESTO`)
```
stateCHANGESTOclosed
priorityCHANGESTO1
assigned_toCHANGESTOuser123
```

### Поле изменилось (любое изменение) (`CHANGES`)
```
stateCHANGES
priorityCHANGES
assigned_toCHANGES
```

### Поле не изменилось (`NOTCHANGESTO`)
```
stateNOTCHANGESTOclosed
priorityNOTCHANGESTO3
```

---

## 5. Поиск по подстроке (`LIKE`)

### Содержит подстроку
```
short_descriptionLIKEпроблема
descriptionLIKEошибка
nameLIKEadmin
```

### Начинается с
```
short_descriptionLIKEИнцидент%
numberLIKEINC%
```

### Заканчивается на
```
short_descriptionLIKE%критичный%
numberLIKE%001
```

---

## 6. Динамические фильтры (`DYNAMIC`)

Используют sys_id динамического фильтра из таблицы `sys_filter_option_dynamic`:

```
assigned_toDYNAMIC156957117519820256
caller_idDYNAMIC156957117519820256
category_idDYNAMICabc123def456
```

**Примеры популярных динамических фильтров:**
- `156957117519820256` — "Мои записи" (текущий пользователь)
- `156957117519820257` — "Мои незавершённые"

---

## 7. Работа с датами

### Конкретная дата
```
sys_created_at=2024-01-15
sys_updated_at=2024-06-30
```

### Диапазон дат
```
sys_created_at>=2024-01-01^sys_created_at<2024-12-31
sys_updated_at>=2024-06-01^sys_updated_at<=2024-06-30
```

### Относительные даты (зависит от конфигурации)
```
sys_created_at>=javascript:gs.daysAgoStart(7)
sys_created_at<=javascript:gs.daysAgoEnd(0)
```

---

## 8. Поиск по списку значений (`IN`, `NOT IN`)

### В списке значений
```
stateINnew,in_progress,resolved
priorityIN1,2,3
categoryINhardware,software,network
```

### Не в списке значений
```
stateNOT INclosed,cancelled
priorityNOT IN4,5
```

---

## 9. Ссылочные поля (Reference)

### По sys_id
```
assigned_to=156957117519820256
caller_id=abc123def456
category_id=xyz789
```

### По имени связанной записи (через точку)
```
assigned_to.name=Иванов
caller_id.department=IT
category_id.name=Оборудование
```

---

## 10. Готовые примеры для тестирования

### 10.1. Инциденты (`itsm_incident`)

```bash
# Все активные инциденты
active=1

# Активные инциденты с высоким приоритетом
active=1^priority=1

# Новые инциденты без исполнителя
state=new^assigned_toISEMPTY

# Мои активные инциденты
assigned_toDYNAMIC156957117519820256^active=1

# Инциденты, созданные за последний месяц
sys_created_at>=2024-01-01^sys_created_at<2024-02-01

# Инциденты со словом "ошибка" в описании
short_descriptionLIKEошибка

# Критичные инциденты (приоритет 1 или 2)
priority=1^ORpriority=2

# Инциденты в работе или на решении
state=in_progress^ORstate=resolved
```

### 10.2. Задачи (`task`, `itsm_task`)

```bash
# Все открытые задачи
state!=closed

# Задачи без исполнителя
assigned_toISEMPTY

# Задачи с исполнителем
assigned_toISNOTEMPTY

# Задачи, где я исполнитель
assigned_toDYNAMIC156957117519820256

# Задачи, созданные сегодня
sys_created_at>=2024-01-15^sys_created_at<2024-01-16

# Задачи с дедлайном на этой неделе
due_date>=2024-01-15^due_date<=2024-01-21

# Задачи по проекту
project_id=abc123def456

# Задачи с определённой категорией
category=development^ORcategory=testing
```

### 10.3. Пользователи (`sys_user`)

```bash
# Активные пользователи
active=1

# Пользователи из департамента IT
department=IT

# Пользователи с ролью admin
rolesLIKEadmin

# Пользователи, у которых email содержит @company.com
emailLIKE@company.com

# Неактивные пользователи
active=0
```

### 10.4. Системные таблицы

```bash
# Таблицы с именем, содержащим "incident"
nameLIKEincident

# Активные бизнес-правила для таблицы
table_id=123456789^active=1

# Клиентские скрипты типа onLoad
type=onLoad^active=1

# Виджеты с определённым тегом
tagsLIKEportal
```

---

## 11. Команды для тестирования через MCP

### Пример 1: Чтение с простым фильтром
```
Вызови table_read с tableName="itsm_incident", query="active=1", limit=10
```

### Пример 2: Чтение с комбинированным фильтром
```
Вызови table_read с tableName="itsm_incident", query="active=1^priority=1", fields="number,short_description,state,priority", limit=20
```

### Пример 3: Чтение с динамическим фильтром
```
Вызови table_read с tableName="task", query="assigned_toDYNAMIC156957117519820256", fields="number,subject,assigned_to", limit=10
```

### Пример 4: Чтение с поиском по подстроке
```
Вызови table_read с tableName="itsm_incident", query="short_descriptionLIKEошибка", fields="number,short_description,sys_created_at", limit=15
```

### Пример 5: Чтение с диапазоном дат
```
Вызови table_read с tableName="itsm_incident", query="sys_created_at>=2024-01-01^sys_created_at<2024-12-31", fields="number,short_description,sys_created_at", limit=50
```

### Пример 6: Чтение с ИЛИ-условием
```
Вызови table_read с tableName="task", query="state=new^ORstate=in_progress", fields="number,subject,state,assigned_to", limit=20
```

### Пример 7: Чтение с проверкой на пустоту
```
Вызови table_read с tableName="task", query="assigned_toISEMPTY^state!=closed", fields="number,subject,state", limit=10
```

### Пример 8: Чтение со списком значений
```
Вызови table_read с tableName="itsm_incident", query="priorityIN1,2", fields="number,short_description,priority,state", limit=20
```

---

## 12. Команды для CLI-скриптов

```bash
# Базовый поиск
node scripts/simpleone/search.js --table=itsm_incident --query="active=1"

# С полями и лимитом
node scripts/simpleone/search.js --table=itsm_incident --query="active=1^priority=1" --fields="number,short_description,state" --limit=10

# С динамическим фильтром
node scripts/simpleone/search.js --table=task --query="assigned_toDYNAMIC156957117519820256" --limit=20

# С поиском по подстроке
node scripts/simpleone/search.js --table=itsm_incident --query="short_descriptionLIKEошибка" --limit=15

# С диапазоном дат
node scripts/simpleone/search.js --table=itsm_incident --query="sys_created_at>=2024-01-01" --limit=50

# С ИЛИ-условием
node scripts/simpleone/search.js --table=task --query="state=new^ORstate=in_progress" --limit=20
```

---

## 13. Мнемоника операторов

| Оператор | Мнемоника | Пример |
|----------|-----------|--------|
| `=` | Равно | `state=new` |
| `!=` | Не равно | `state!=closed` |
| `ISEMPTY` | **IS** **EMPTY** — пусто | `assigned_toISEMPTY` |
| `ISNOTEMPTY` | **IS NOT EMPTY** — не пусто | `assigned_toISNOTEMPTY` |
| `CHANGESTO` | **CHANGE** **TO** — изменилось на | `stateCHANGESTOnew` |
| `CHANGES` | Изменилось (любое) | `stateCHANGES` |
| `LIKE` | Подобно (поиск) | `nameLIKEadmin` |
| `DYNAMIC` | Динамический фильтр | `assigned_toDYNAMIC...` |
| `IN` | В списке | `priorityIN1,2,3` |
| `^` | **И** (AND) | `a=1^b=2` |
| `^OR` | **ИЛИ** (OR) | `a=1^ORb=2` |

---

## 14. Частые ошибки

### ❌ Неправильно
```
state = new              // Пробелы вокруг оператора
state CHANGES TO new     // Раздельный CHANGESTO
assigned_to is empty     // Пробелы в ISEMPTY
priorityIN 1,2,3         // Пробел после IN
(active=1)               // Лишние скобки для одного условия
state=new AND priority=1 // Использование AND вместо ^
```

### ✅ Правильно
```
state=new
stateCHANGESTOnew
assigned_toISEMPTY
priorityIN1,2,3
active=1
state=new^priority=1
```

---

## 15. Тестовый чек-лист

Протестируйте следующие сценарии:

- [ ] Одиночное условие: `active=1`
- [ ] Несколько условий И: `active=1^priority=1`
- [ ] Условия ИЛИ: `state=new^ORstate=in_progress`
- [ ] Проверка на пустоту: `assigned_toISEMPTY`
- [ ] Проверка на заполненность: `assigned_toISNOTEMPTY`
- [ ] Изменение значения: `stateCHANGESTOnew`
- [ ] Поиск по подстроке: `descriptionLIKEошибка`
- [ ] Динамический фильтр: `assigned_toDYNAMIC...`
- [ ] Список значений: `priorityIN1,2,3`
- [ ] Диапазон дат: `sys_created_at>=2024-01-01^sys_created_at<2024-12-31`
- [ ] Комбинированный запрос: `(active=1^priority=1)^OR(state=new^assigned_toISNOTEMPTY)`

---

## 16. Полезные ссылки

- [SimpleOne REST API Documentation](https://docs.simpleone.ru/platform/developer/integration/rest-api/table-api)
- [Dynamic Filters](https://docs.simpleone.ru/platform/admin/auxiliary/condition-builder/filters#dynamic-filters)
