// Test Supabase database connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔌 Проверка подключения к Supabase...\n')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Подключение к базе данных успешно!\n')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log(`📊 Текущее количество пользователей: ${userCount}`)
    
    const courseCount = await prisma.course.count()
    console.log(`📚 Текущее количество курсов: ${courseCount}\n`)
    
    if (userCount === 0 && courseCount === 0) {
      console.log('💡 База данных пуста. Запустите: npm run db:seed\n')
    }
    
    console.log('✅ Все проверки пройдены успешно!')
    
  } catch (error: any) {
    console.error('❌ Ошибка подключения к базе данных:\n')
    
    if (error.code === 'P1001') {
      console.error('Не удалось подключиться к базе данных.')
      console.error('Проверьте:')
      console.error('  1. Правильность DATABASE_URL в .env файле')
      console.error('  2. Правильность пароля базы данных')
      console.error('  3. Доступность базы данных Supabase\n')
    } else if (error.code === 'P1012') {
      console.error('Переменная окружения DATABASE_URL не найдена.')
      console.error('Убедитесь, что файл .env существует и содержит DATABASE_URL\n')
    } else {
      console.error(error.message)
      console.error('\nКод ошибки:', error.code)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

