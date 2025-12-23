// Script to update DATABASE_URL in .env file
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const password = 'Km13nn07!z*';
// URL encode special characters in password for URL
const encodedPassword = encodeURIComponent(password);
const databaseUrl = `postgresql://postgres:${encodedPassword}@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require`;

console.log('🔄 Обновление .env файла...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ Файл .env не найден!');
  console.log('Создайте файл .env в корне проекта.\n');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Update or add DATABASE_URL
if (envContent.includes('DATABASE_URL=')) {
  // Replace existing DATABASE_URL (match any format)
  envContent = envContent.replace(
    /DATABASE_URL=.*/g,
    `DATABASE_URL="${databaseUrl}"`
  );
  console.log('✅ Обновлен существующий DATABASE_URL');
} else {
  // Add DATABASE_URL if it doesn't exist
  envContent += `\nDATABASE_URL="${databaseUrl}"\n`;
  console.log('✅ Добавлен новый DATABASE_URL');
}

fs.writeFileSync(envPath, envContent, 'utf8');

console.log('\n✅ Файл .env успешно обновлен!');
console.log('\nТеперь выполните: npm run db:push\n');

