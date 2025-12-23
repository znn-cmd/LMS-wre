// Test direct connection to Supabase
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔌 Тестирование прямого подключения к Supabase...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    await client.connect();
    console.log('✅ Подключение успешно!\n');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Версия PostgreSQL:', result.rows[0].version);
    
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Найдено таблиц: ${tableResult.rows.length}`);
    if (tableResult.rows.length > 0) {
      console.log('Таблицы:');
      tableResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    await client.end();
    console.log('\n✅ Тест завершен успешно!');
    
  } catch (error) {
    console.error('\n❌ Ошибка подключения:');
    console.error(error.message);
    console.error('\n💡 Попробуйте:');
    console.error('1. Проверьте, что проект Supabase активен');
    console.error('2. Проверьте пароль базы данных в Supabase Dashboard');
    console.error('3. Убедитесь, что IP не заблокирован в настройках Supabase');
    process.exit(1);
  }
}

testConnection();

