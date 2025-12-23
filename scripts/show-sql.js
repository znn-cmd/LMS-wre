// Script to display SQL for manual execution in Supabase
const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'create-tables-safe.sql');

try {
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  console.log('📄 SQL для создания таблиц в Supabase (Безопасная версия):\n');
  console.log('⚠️  ВНИМАНИЕ: Этот скрипт удалит все существующие таблицы и типы!');
  console.log('=' .repeat(50));
  console.log(sqlContent);
  console.log('=' .repeat(50));
  console.log('\n📋 Инструкция:');
  console.log('1. Откройте: https://supabase.com/dashboard/project/cndmouefqjfmxgovrzbx/sql');
  console.log('2. Скопируйте SQL выше');
  console.log('3. Вставьте в SQL Editor');
  console.log('4. Нажмите "Run"');
  console.log('\n✅ Этот скрипт безопасно пересоздаст все таблицы, даже если они уже существуют');
  console.log('\nПосле создания таблиц выполните:');
  console.log('  npm run db:seed');
  console.log('  npm run db:test');
  console.log('  npm run dev');

} catch (error) {
  console.error('❌ Ошибка чтения SQL файла:', error.message);
}
