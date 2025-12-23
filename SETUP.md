# Настройка переменных окружения

## Шаг 1: Создайте файл .env в корне проекта

Создайте файл `.env` (не `.env.local`) в корне проекта со следующим содержимым:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZG1vdWVmcWpmbXhnb3ZyemJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4ODgwNCwiZXhwIjoyMDgxNDY0ODA0fQ.KnUYKUEFZy_iraU4BBEIhRb0628tvrzRoF1N_2y9xmM

# Database (for Prisma)
# ⚠️ ВАЖНО: Замените [YOUR-PASSWORD] на ваш реальный пароль базы данных Supabase
# 
# Как получить пароль:
# 1. Откройте Supabase Dashboard: https://supabase.com/dashboard
# 2. Выберите ваш проект
# 3. Settings → Database
# 4. Найдите "Database password" или "Connection string"
# 5. Скопируйте пароль и вставьте вместо [YOUR-PASSWORD]
#
# Или используйте готовую строку подключения из:
# Settings → Database → Connection string → URI
#
# Вариант 1: Прямое подключение (порт 5432)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"

# Вариант 2: Connection Pooler (порт 6543) - рекомендуется для продакшена
# Получите строку из: Supabase Dashboard > Settings > Database > Connection pooling > Session mode
# DATABASE_URL="postgresql://postgres.cndmouefqjfmxgovrzbx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Шаг 2: Получите пароль базы данных

Если у вас нет пароля базы данных:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект `cndmouefqjfmxgovrzbx`
3. Перейдите в **Settings** → **Database**
4. Найдите секцию **Database password**
5. Если пароль не установлен, нажмите **Reset database password** и сохраните новый пароль
6. Скопируйте пароль

## Шаг 3: Обновите DATABASE_URL

В файле `.env` замените `[YOUR-PASSWORD]` на реальный пароль:

```env
DATABASE_URL="postgresql://postgres:ваш_реальный_пароль@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres"
```

**Пример:**
```env
DATABASE_URL="postgresql://postgres:MySecurePassword123@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres"
```

## Шаг 4: Проверьте подключение

После создания `.env` файла выполните:

```bash
npm run db:push
```

Если всё настроено правильно, Prisma подключится к базе данных и создаст схему.

## Альтернативный способ: Использование Connection Pooler

Если обычное подключение не работает, используйте Connection Pooler:

```env
DATABASE_URL="postgresql://postgres.cndmouefqjfmxgovrzbx:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

Где `[REGION]` - это регион вашего проекта (можно найти в настройках проекта).

## Troubleshooting

### Ошибка "Environment variable not found: DATABASE_URL"

- Убедитесь, что файл называется именно `.env` (не `.env.local`)
- Убедитесь, что файл находится в корне проекта (там же, где `package.json`)
- Проверьте, что в `DATABASE_URL` нет лишних пробелов или кавычек

### Ошибка подключения к базе данных

- Проверьте правильность пароля
- Убедитесь, что IP адрес не заблокирован в Supabase (Settings → Database → Connection pooling)
- Попробуйте использовать Connection Pooler вместо прямого подключения

