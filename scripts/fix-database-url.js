// Script to fix DATABASE_URL with SSL parameter
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace DATABASE_URL with SSL parameter
  const oldUrl = 'DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres"';
  const newUrl = 'DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"';
  
  if (envContent.includes(oldUrl)) {
    envContent = envContent.replace(oldUrl, newUrl);
    fs.writeFileSync(envPath, envContent);
    console.log('✅ DATABASE_URL обновлен с параметром SSL!\n');
    console.log('Новая строка подключения:');
    console.log(newUrl);
  } else if (!envContent.includes('sslmode=require')) {
    // Try to add sslmode if URL exists but without it
    envContent = envContent.replace(
      /DATABASE_URL="postgresql:\/\/[^"]+"/,
      (match) => {
        if (!match.includes('?')) {
          return match.replace('"', '?sslmode=require"');
        }
        return match;
      }
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ DATABASE_URL обновлен с параметром SSL!\n');
  } else {
    console.log('✅ DATABASE_URL уже содержит параметр SSL\n');
  }
  
  console.log('\n🎯 Теперь попробуйте:');
  console.log('  npm run db:test    - проверить подключение');
  console.log('  npm run db:seed    - заполнить базу данными');
  
} catch (error) {
  console.error('❌ Ошибка при обновлении .env файла:', error.message);
  console.log('\n🔧 Ручное обновление:');
  console.log('Добавьте ?sslmode=require в конец DATABASE_URL в файле .env');
  console.log('Пример:');
  console.log('DATABASE_URL="postgresql://postgres:Km13nn07!z*@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require"');
}

