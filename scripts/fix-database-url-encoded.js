// Script to fix DATABASE_URL with URL-encoded password and SSL
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// URL encode password: Km13nn07!z* becomes Km13nn07%21z%2A
const encodedPassword = 'Km13nn07%21z%2A';
const newUrl = `DATABASE_URL="postgresql://postgres:${encodedPassword}@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"`;

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace any existing DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL="[^"]+"/,
    newUrl
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ DATABASE_URL обновлен с URL-encoded паролем и SSL!\n');
  console.log('Новая строка подключения:');
  console.log(newUrl);
  console.log('\n🎯 Теперь попробуйте:');
  console.log('  npm run db:test    - проверить подключение');
  console.log('  npm run db:seed    - заполнить базу данными');
  
} catch (error) {
  console.error('❌ Ошибка при обновлении .env файла:', error.message);
}

