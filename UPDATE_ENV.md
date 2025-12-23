# Обновление DATABASE_URL

Обновите файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"
```

**Важно:** 
- Пароль содержит специальные символы (`!` и `*`), поэтому он должен быть в кавычках
- Добавлен параметр `?sslmode=require` для безопасного подключения к Supabase

После обновления выполните:
```bash
npm run db:push
```

