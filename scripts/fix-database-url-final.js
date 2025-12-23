// Final fix for DATABASE_URL with all necessary parameters
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// Try with connection timeout and proper SSL settings
const newUrl = 'DATABASE_URL="postgresql://postgres:Km13nn07%21z%2A@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require&connect_timeout=10"';

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace any existing DATABASE_URL
  envContent = envContent.replace(
    /DATABASE_URL="[^"]+"/,
    newUrl
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ DATABASE_URL обновлен с параметрами подключения!\n');
  console.log('Новая строка:');
  console.log(newUrl);
  console.log('\n📋 Если это не поможет, выполните:');
  console.log('1. Откройте: https://supabase.com/dashboard/project/cndmouefqjfmxgovrzbx/settings/database');
  console.log('2. Скопируйте Connection string из раздела "Connection pooling"');
  console.log('3. Замените DATABASE_URL в .env файле');
  console.log('\n🎯 Теперь попробуйте:');
  console.log('  npm run db:test');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
}

