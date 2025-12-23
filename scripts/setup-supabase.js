// Script to set up Supabase connection
const fs = require('fs');
const path = require('path');

console.log('🚀 Настройка подключения к Supabase\n');

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cndmouefqjfmxgovrzbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_AlCrI62hTdb9ZJ5Rr2X_fg_2NF7YpCr
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZG1vdWVmcWpmbXhnb3ZyemJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg4ODgwNCwiZXhwIjoyMDgxNDY0ODA0fQ.KnUYKUEFZy_iraU4BBEIhRb0628tvrzRoF1N_2y9xmM

# Database (Supabase PostgreSQL) - SSL required
DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Файл .env успешно создан!\n');
  console.log('📁 Содержимое .env:');
  console.log(envContent);
  console.log('\n🎯 Следующие шаги:');
  console.log('  npm run db:generate  - генерация Prisma клиента');
  console.log('  npm run db:push      - создание схемы в Supabase');
  console.log('  npm run db:seed      - заполнение демо-данными');
  console.log('  npm run dev          - запуск сервера разработки');

} catch (error) {
  console.error('❌ Ошибка при создании .env файла:', error.message);
  console.log('\n🔧 Ручная настройка:');
  console.log('Создайте файл .env в корне проекта со следующим содержимым:');
  console.log(envContent);
}

