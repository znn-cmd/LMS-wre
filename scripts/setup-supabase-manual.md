# Ручная настройка Supabase

Поскольку автоматическое создание схемы через Prisma не работает из-за ограничений Supabase, выполните следующие шаги:

## Шаг 1: Создание таблиц

1. Откройте Supabase Dashboard: https://supabase.com/dashboard/project/cndmouefqjfmxgovrzbx/sql
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `scripts/create-tables.sql`
4. Вставьте в SQL Editor и нажмите "Run"

Это создаст все необходимые таблицы для LMS.

## Шаг 2: Заполнение демо-данными

После создания таблиц запустите:
```bash
npm run db:seed
```

## Шаг 3: Проверка подключения

```bash
npm run db:test
```

## Шаг 4: Запуск приложения

```bash
npm run dev
```

## Демо-аккаунты

- **Admin**: admin@demo.com / demo123
- **Teacher**: teacher@demo.com / demo123
- **Team Lead**: teamlead@demo.com / demo123
- **Student 1**: student1@demo.com / demo123
- **Student 2**: student2@demo.com / demo123

## Переменные окружения

В файле `.env` уже прописаны:
- NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
- SUPABASE_SERVICE_ROLE_KEY=[скрыт]
- DATABASE_URL=postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres

