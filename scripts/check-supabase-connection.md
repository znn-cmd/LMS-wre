# Проверка подключения к Supabase

## Проблема
Prisma не может подключиться к базе данных Supabase.

## Возможные решения

### 1. Проверьте Connection Pooling в Supabase

Supabase предоставляет два типа подключения:

**Direct Connection (прямое):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Connection Pooler (рекомендуется для приложений):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### 2. Проверьте настройки в Supabase Dashboard

1. Откройте: https://supabase.com/dashboard/project/cndmouefqjfmxgovrzbx/settings/database
2. Проверьте:
   - **Connection string** - скопируйте правильную строку
   - **Connection pooling** - включите если выключено
   - **IP Allowlist** - убедитесь, что ваш IP не заблокирован

### 3. Используйте Connection Pooler URL

В Supabase Dashboard:
- Settings → Database → Connection string
- Выберите "Connection pooling" → "Session mode"
- Скопируйте строку подключения
- Замените DATABASE_URL в .env

### 4. Проверьте пароль базы данных

1. Settings → Database → Database password
2. Если пароль не установлен, нажмите "Reset database password"
3. Обновите DATABASE_URL с новым паролем

### 5. Альтернативный формат DATABASE_URL

Попробуйте использовать формат с явным указанием SSL:

```
DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require&connect_timeout=10"
```

Или с connection pooler:

```
DATABASE_URL="postgresql://postgres.cndmouefqjfmxgovrzbx:Km13nn07!z*@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
```

## Быстрая проверка

Выполните в Supabase SQL Editor:
```sql
SELECT version();
```

Если запрос выполняется успешно, значит база доступна и проблема в строке подключения.

