// Quick connection test
require('dotenv').config({ path: '.env' });

console.log('🔍 Проверка переменных окружения...\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Установлен' : '❌ Не установлен');
if (process.env.DATABASE_URL) {
  // Mask password
  const url = process.env.DATABASE_URL;
  const masked = url.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  console.log('   ', masked);
}
console.log('\n');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔌 Попытка подключения к базе данных...\n');
    
    // Set timeout
    const timeout = setTimeout(() => {
      console.log('⏱️  Подключение занимает слишком много времени...');
      console.log('Возможно, проблема с сетью или базой данных.\n');
      process.exit(1);
    }, 10000); // 10 seconds timeout
    
    await prisma.$connect();
    clearTimeout(timeout);
    
    console.log('✅ Подключение успешно!\n');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Запрос выполнен успешно:', result);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📊 Существующие таблицы:', tables.length);
    if (tables.length > 0) {
      tables.forEach(t => console.log('   -', t.table_name));
    } else {
      console.log('   База данных пуста. Нужно выполнить db:push\n');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Код:', error.code);
    if (error.code === 'P1001') {
      console.error('\nНе удалось подключиться к базе данных.');
      console.error('Проверьте:');
      console.error('  1. Правильность пароля в DATABASE_URL');
      console.error('  2. Доступность базы данных Supabase');
      console.error('  3. Настройки firewall/сети\n');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

test();

