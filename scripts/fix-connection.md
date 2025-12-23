# Исправление подключения к Supabase

Если вы получили ошибку аутентификации, попробуйте следующие варианты:

## Вариант 1: Использование Connection Pooler (рекомендуется)

В Supabase Dashboard:
1. Settings → Database → Connection pooling
2. Скопируйте строку из секции **Connection string** → **Session mode**
3. Используйте её в DATABASE_URL

Формат будет примерно таким:
```
postgresql://postgres.cndmouefqjfmxgovrzbx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## Вариант 2: Проверка пароля

1. Убедитесь, что пароль правильный
2. Если забыли пароль: Settings → Database → Reset database password
3. Обновите DATABASE_URL в .env файле

## Вариант 3: Использование прямого подключения с правильным форматом

Попробуйте формат:
```
postgresql://postgres:[PASSWORD]@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require
```

## Вариант 4: Получение готовой строки подключения

В Supabase Dashboard:
1. Settings → Database → Connection string
2. Выберите "URI" 
3. Скопируйте готовую строку (там уже будет правильный формат)

