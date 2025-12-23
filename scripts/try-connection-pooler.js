// Try connection pooler URL for Supabase
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// Supabase connection pooler format
// Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
// For project cndmouefqjfmxgovrzbx, we need to find the region

console.log('🔍 Попытка использовать Connection Pooler для Supabase\n');

// Try different common regions
const regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1'];

const poolerUrls = regions.map(region => 
  `postgresql://postgres.cndmouefqjfmxgovrzbx:Km13nn07%21z%2A@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`
);

console.log('📋 Попробуйте эти варианты Connection Pooler URL:\n');
poolerUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}\n`);
});

console.log('📝 Инструкция:');
console.log('1. Откройте Supabase Dashboard: https://supabase.com/dashboard/project/cndmouefqjfmxgovrzbx/settings/database');
console.log('2. Найдите "Connection string" → "Connection pooling" → "Session mode"');
console.log('3. Скопируйте правильный URL (с вашим регионом)');
console.log('4. Замените DATABASE_URL в .env файле');
console.log('\nИли используйте прямой URL с дополнительными параметрами:');
console.log('DATABASE_URL="postgresql://postgres:Km13nn07%21z%2A@db.cndmouefqjfmxgovrzbx.supabase.co:5432/postgres?sslmode=require&connect_timeout=10&sslcert=&sslkey=&sslrootcert="');

