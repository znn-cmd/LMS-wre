// Fix .env.local with correct DATABASE_URL
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

try {
  // Read current .env to get the correct DATABASE_URL
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/DATABASE_URL[^\n]*/);
  
  if (!dbUrlMatch) {
    console.error('❌ Не найден DATABASE_URL в .env файле');
    process.exit(1);
  }
  
  const correctDbUrl = dbUrlMatch[0];
  
  // Read .env.local if exists
  let envLocalContent = '';
  if (fs.existsSync(envLocalPath)) {
    envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  }
  
  // Replace or add DATABASE_URL
  if (envLocalContent.includes('DATABASE_URL')) {
    envLocalContent = envLocalContent.replace(
      /DATABASE_URL[^\n]*/g,
      correctDbUrl
    );
  } else {
    envLocalContent += `\n${correctDbUrl}\n`;
  }
  
  fs.writeFileSync(envLocalPath, envLocalContent);
  
  console.log('✅ .env.local обновлен с правильным DATABASE_URL!\n');
  console.log('Обновленная строка:');
  console.log(correctDbUrl);
  console.log('\n🔄 Перезапустите сервер разработки:');
  console.log('  1. Остановите текущий сервер (Ctrl+C)');
  console.log('  2. Запустите снова: npm run dev');
  
} catch (error) {
  console.error('❌ Ошибка при обновлении .env.local:', error.message);
}

