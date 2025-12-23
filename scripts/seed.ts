import { PrismaClient, UserRole, CourseStatus, ContentBlockType, QuestionType } from '@prisma/client'

function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64')
}

const prisma = new PrismaClient()

function createLesson(
  order: number,
  titleRu: string,
  titleEn: string,
  estimatedTime: number,
  minimumTime: number,
  contentRu: string,
  contentEn: string
) {
  return {
    titleRu,
    titleEn,
    order,
    estimatedTime,
    minimumTime,
    contentBlocks: {
      create: [
        {
          type: ContentBlockType.TEXT,
          order: 1,
          contentRu: { type: 'text', content: contentRu },
          contentEn: { type: 'text', content: contentEn },
        },
      ],
    },
  }
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashPassword('demo123'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      email: 'teacher@demo.com',
      password: hashPassword('demo123'),
      firstName: 'Teacher',
      lastName: 'User',
      role: UserRole.TEACHER,
    },
  })

  const teamLead = await prisma.user.upsert({
    where: { email: 'teamlead@demo.com' },
    update: {},
    create: {
      email: 'teamlead@demo.com',
      password: hashPassword('demo123'),
      firstName: 'Team',
      lastName: 'Lead',
      role: UserRole.TEAM_LEAD,
      department: 'Sales',
      team: 'Asia Pacific',
    },
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@demo.com' },
    update: {},
    create: {
      email: 'student1@demo.com',
      password: hashPassword('demo123'),
      firstName: 'Student',
      lastName: 'One',
      role: UserRole.STUDENT,
      department: 'Sales',
      team: 'Asia Pacific',
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@demo.com' },
    update: {},
    create: {
      email: 'student2@demo.com',
      password: hashPassword('demo123'),
      firstName: 'Student',
      lastName: 'Two',
      role: UserRole.STUDENT,
      department: 'Sales',
      team: 'Asia Pacific',
    },
  })

  // Create team relationships
  await prisma.teamMember.upsert({
    where: {
      teamLeadId_memberId: {
        teamLeadId: teamLead.id,
        memberId: student1.id,
      },
    },
    update: {},
    create: {
      teamLeadId: teamLead.id,
      memberId: student1.id,
    },
  })

  await prisma.teamMember.upsert({
    where: {
      teamLeadId_memberId: {
        teamLeadId: teamLead.id,
        memberId: student2.id,
      },
    },
    update: {},
    create: {
      teamLeadId: teamLead.id,
      memberId: student2.id,
    },
  })

  // Create Thailand Course
  const course = await prisma.course.create({
    data: {
      titleRu: 'Таиланд: Обзор страны и основы недвижимости',
      titleEn: 'Thailand: Country Overview & Real Estate Basics',
      descriptionRu: 'Комплексный курс о Таиланде, его географии, культуре, экономике и рынке недвижимости',
      descriptionEn: 'Comprehensive course about Thailand, its geography, culture, economy, and real estate market',
      status: CourseStatus.PUBLISHED,
      version: 1,
      publishedAt: new Date(),
      creatorId: teacher.id,
      modules: {
        create: [
          {
            titleRu: 'География и регионы',
            titleEn: 'Geography & Regions',
            order: 1,
            lessons: {
              create: [
                createLesson(1, 'Введение в географию Таиланда', 'Introduction to Thailand Geography', 15, 10,
                  'Таиланд расположен в Юго-Восточной Азии и граничит с Мьянмой, Лаосом, Камбоджей и Малайзией.',
                  'Thailand is located in Southeast Asia and borders Myanmar, Laos, Cambodia, and Malaysia.'),
                createLesson(2, 'Административное деление', 'Administrative Division', 12, 8,
                  'Страна разделена на 77 провинций, которые сгруппированы в 6 регионов.',
                  'The country is divided into 77 provinces, grouped into 6 regions.'),
                createLesson(3, 'Климат и природные условия', 'Climate and Natural Conditions', 12, 8,
                  'Таиланд имеет тропический климат с тремя сезонами: жаркий, дождливый и прохладный.',
                  'Thailand has a tropical climate with three seasons: hot, rainy, and cool.'),
                createLesson(4, 'Рельеф и ландшафт', 'Terrain and Landscape', 10, 7,
                  'Территория Таиланда включает горы на севере, плато на северо-востоке и равнины в центре.',
                  'Thailand\'s territory includes mountains in the north, plateaus in the northeast, and plains in the center.'),
                createLesson(5, 'Водные ресурсы', 'Water Resources', 10, 7,
                  'Основные реки: Чао Прайя, Меконг и их притоки.',
                  'Main rivers: Chao Phraya, Mekong and their tributaries.'),
              ],
            },
          },
          {
            titleRu: 'Культура и общество',
            titleEn: 'Culture & Society',
            order: 2,
            lessons: {
              create: [
                createLesson(1, 'Тайская культура и традиции', 'Thai Culture and Traditions', 20, 15,
                  'Тайская культура глубоко укоренена в буддизме и уважении к монархии.',
                  'Thai culture is deeply rooted in Buddhism and respect for the monarchy.'),
                createLesson(2, 'Буддизм в Таиланде', 'Buddhism in Thailand', 18, 12,
                  'Более 90% населения исповедуют буддизм Тхеравады.',
                  'More than 90% of the population practice Theravada Buddhism.'),
                createLesson(3, 'Тайский язык и общение', 'Thai Language and Communication', 15, 10,
                  'Тайский язык имеет сложную систему вежливости и социальных статусов.',
                  'Thai language has a complex system of politeness and social statuses.'),
                createLesson(4, 'Традиции и праздники', 'Traditions and Holidays', 16, 11,
                  'Важные праздники: Сонгкран, Лой Кратонг, День рождения короля.',
                  'Important holidays: Songkran, Loy Krathong, King\'s Birthday.'),
                createLesson(5, 'Тайская кухня', 'Thai Cuisine', 14, 10,
                  'Тайская кухня известна балансом сладкого, кислого, соленого и острого.',
                  'Thai cuisine is known for the balance of sweet, sour, salty, and spicy.'),
              ],
            },
          },
          {
            titleRu: 'Экономика',
            titleEn: 'Economy',
            order: 3,
            lessons: {
              create: [
                createLesson(1, 'Экономическая структура Таиланда', 'Thailand Economic Structure', 18, 12,
                  'Экономика основана на экспорте, туризме и сельском хозяйстве.',
                  'Economy is based on exports, tourism, and agriculture.'),
                createLesson(2, 'Основные отрасли', 'Main Industries', 16, 11,
                  'Автомобилестроение, электроника, туризм, сельское хозяйство.',
                  'Automotive, electronics, tourism, agriculture.'),
                createLesson(3, 'Внешняя торговля', 'Foreign Trade', 15, 10,
                  'Основные торговые партнеры: Китай, Япония, США, ЕС.',
                  'Main trading partners: China, Japan, USA, EU.'),
                createLesson(4, 'Валюта и финансы', 'Currency and Finance', 14, 9,
                  'Национальная валюта - тайский бат (THB).',
                  'National currency is Thai Baht (THB).'),
                createLesson(5, 'Инвестиционный климат', 'Investment Climate', 17, 12,
                  'Таиланд привлекателен для иностранных инвестиций благодаря стабильной экономике.',
                  'Thailand is attractive for foreign investment due to stable economy.'),
              ],
            },
          },
          {
            titleRu: 'Правовые основы',
            titleEn: 'Legal Basics',
            order: 4,
            lessons: {
              create: [
                createLesson(1, 'Законодательство о недвижимости', 'Real Estate Legislation', 25, 20,
                  'Иностранцы могут владеть кондоминиумами, но не землей.',
                  'Foreigners can own condominiums but not land.'),
                createLesson(2, 'Права собственности', 'Property Rights', 22, 18,
                  'Система регистрации прав собственности через Департамент земель.',
                  'Property rights registration system through Land Department.'),
                createLesson(3, 'Иностранные инвестиции', 'Foreign Investment', 20, 15,
                  'Закон об иностранных инвестициях регулирует деятельность иностранцев.',
                  'Foreign Investment Act regulates foreign activities.'),
                createLesson(4, 'Налогообложение недвижимости', 'Real Estate Taxation', 18, 14,
                  'Налоги: подоходный налог, налог на передачу, налог на бизнес.',
                  'Taxes: income tax, transfer tax, business tax.'),
                createLesson(5, 'Договоры и сделки', 'Contracts and Transactions', 20, 16,
                  'Все сделки должны быть зарегистрированы и заверены нотариально.',
                  'All transactions must be registered and notarized.'),
              ],
            },
          },
          {
            titleRu: 'Рынок недвижимости',
            titleEn: 'Real Estate Market',
            order: 5,
            lessons: {
              create: [
                createLesson(1, 'Тенденции рынка недвижимости', 'Real Estate Market Trends', 20, 15,
                  'Рынок активно развивается, особенно в Бангкоке, Паттайе и на Пхукете.',
                  'Market is actively developing, especially in Bangkok, Pattaya, and Phuket.'),
                createLesson(2, 'Бангкок: столичный рынок', 'Bangkok: Capital Market', 18, 13,
                  'Бангкок - крупнейший рынок недвижимости с высокими ценами.',
                  'Bangkok is the largest real estate market with high prices.'),
                createLesson(3, 'Курортные регионы', 'Resort Regions', 16, 12,
                  'Пхукет, Паттайя, Самуи - популярные курортные направления.',
                  'Phuket, Pattaya, Samui - popular resort destinations.'),
                createLesson(4, 'Типы недвижимости', 'Property Types', 17, 13,
                  'Кондоминиумы, виллы, таунхаусы, земельные участки.',
                  'Condominiums, villas, townhouses, land plots.'),
                createLesson(5, 'Ценообразование', 'Pricing', 15, 11,
                  'Цены зависят от локации, размера, состояния и инфраструктуры.',
                  'Prices depend on location, size, condition, and infrastructure.'),
              ],
            },
          },
          {
            titleRu: 'Риски и подводные камни',
            titleEn: 'Risks & Pitfalls',
            order: 6,
            lessons: {
              create: [
                createLesson(1, 'Основные риски инвестиций', 'Main Investment Risks', 22, 18,
                  'Риски: валютные колебания, изменения в законодательстве, проблемы с правами собственности.',
                  'Risks: currency fluctuations, legislation changes, property rights issues.'),
                createLesson(2, 'Валютные риски', 'Currency Risks', 18, 14,
                  'Колебания курса бата могут влиять на стоимость инвестиций.',
                  'Baht exchange rate fluctuations can affect investment value.'),
                createLesson(3, 'Правовые риски', 'Legal Risks', 19, 15,
                  'Изменения в законодательстве могут повлиять на права собственности.',
                  'Legislation changes can affect property rights.'),
                createLesson(4, 'Рыночные риски', 'Market Risks', 17, 13,
                  'Ликвидность рынка и возможность продажи недвижимости.',
                  'Market liquidity and ability to sell property.'),
                createLesson(5, 'Как минимизировать риски', 'How to Minimize Risks', 20, 16,
                  'Тщательное исследование, юридическая проверка, диверсификация.',
                  'Thorough research, legal due diligence, diversification.'),
              ],
            },
          },
          {
            titleRu: 'Итоги',
            titleEn: 'Summary',
            order: 7,
            lessons: {
              create: [
                createLesson(1, 'Ключевые выводы', 'Key Takeaways', 15, 10,
                  'Таиланд предлагает интересные возможности для инвестиций в недвижимость.',
                  'Thailand offers interesting opportunities for real estate investment.'),
                createLesson(2, 'Практические рекомендации', 'Practical Recommendations', 14, 10,
                  'Важно изучить местное законодательство и провести юридическую проверку.',
                  'It\'s important to study local legislation and conduct legal due diligence.'),
                createLesson(3, 'Следующие шаги', 'Next Steps', 12, 8,
                  'Определить цели инвестирования, выбрать регион, найти надежного партнера.',
                  'Define investment goals, choose region, find reliable partner.'),
              ],
            },
          },
        ],
      },
    },
  })

  // Create test
  const test = await prisma.test.create({
    data: {
      titleRu: 'Итоговый тест по курсу "Таиланд"',
      titleEn: 'Thailand Course Final Test',
      descriptionRu: 'Проверка знаний по курсу о Таиланде',
      descriptionEn: 'Knowledge check for Thailand course',
      passingScore: 70,
      timeLimit: 30,
      maxAttempts: 3,
      allowRetake: true,
      randomizeQuestions: false,
      shuffleAnswers: true,
      creatorId: teacher.id,
            questions: {
        create: [
          {
            type: QuestionType.SINGLE_CHOICE,
            order: 1,
            questionRu: 'Сколько провинций в Таиланде?',
            questionEn: 'How many provinces are in Thailand?',
            options: {
              choices: [
                { id: '1', text: '65' },
                { id: '2', text: '77' },
                { id: '3', text: '85' },
                { id: '4', text: '92' },
              ],
            },
            correctAnswer: { answer: '2' },
            points: 1,
            explanationRu: 'Таиланд разделен на 77 провинций.',
            explanationEn: 'Thailand is divided into 77 provinces.',
          },
          {
            type: QuestionType.MULTIPLE_CHOICE,
            order: 2,
            questionRu: 'Какие регионы есть в Таиланде? (выберите все правильные)',
            questionEn: 'Which regions are in Thailand? (select all correct)',
            options: {
              choices: [
                { id: '1', text: 'Север' },
                { id: '2', text: 'Юг' },
                { id: '3', text: 'Центр' },
                { id: '4', text: 'Запад' },
              ],
            },
            correctAnswer: { answers: ['1', '2', '3', '4'] },
            points: 2,
          },
          {
            type: QuestionType.TRUE_FALSE,
            order: 3,
            questionRu: 'Иностранцы могут владеть землей в Таиланде.',
            questionEn: 'Foreigners can own land in Thailand.',
            options: {},
            correctAnswer: { answer: false },
            points: 1,
            explanationRu: 'Иностранцы не могут напрямую владеть землей, только кондоминиумами.',
            explanationEn: 'Foreigners cannot directly own land, only condominiums.',
          },
          {
            type: QuestionType.SHORT_TEXT,
            order: 4,
            questionRu: 'Какой город является столицей Таиланда?',
            questionEn: 'What city is the capital of Thailand?',
            options: {},
            correctAnswer: { answer: 'Bangkok' },
            points: 1,
          },
          {
            type: QuestionType.SINGLE_CHOICE,
            order: 5,
            questionRu: 'Какая религия преобладает в Таиланде?',
            questionEn: 'What religion is predominant in Thailand?',
            options: {
              choices: [
                { id: '1', text: 'Христианство' },
                { id: '2', text: 'Буддизм' },
                { id: '3', text: 'Ислам' },
                { id: '4', text: 'Индуизм' },
              ],
            },
            correctAnswer: { answer: '2' },
            points: 1,
          },
          {
            type: QuestionType.MULTIPLE_CHOICE,
            order: 6,
            questionRu: 'Какие основные отрасли экономики Таиланда?',
            questionEn: 'What are the main industries of Thailand\'s economy?',
            options: {
              choices: [
                { id: '1', text: 'Туризм' },
                { id: '2', text: 'Автомобилестроение' },
                { id: '3', text: 'Сельское хозяйство' },
                { id: '4', text: 'Электроника' },
              ],
            },
            correctAnswer: { answers: ['1', '2', '3', '4'] },
            points: 2,
          },
          {
            type: QuestionType.ORDERING,
            order: 7,
            questionRu: 'Расположите сезоны Таиланда в правильном порядке',
            questionEn: 'Arrange Thailand\'s seasons in correct order',
            options: {
              items: [
                { id: '1', text: 'Жаркий сезон' },
                { id: '2', text: 'Сезон дождей' },
                { id: '3', text: 'Прохладный сезон' },
              ],
            },
            correctAnswer: { order: ['1', '2', '3'] },
            points: 2,
          },
          {
            type: QuestionType.MATCHING,
            order: 8,
            questionRu: 'Сопоставьте города с их характеристиками',
            questionEn: 'Match cities with their characteristics',
            options: {
              pairs: [
                { left: 'Бангкок', right: 'Столица' },
                { left: 'Пхукет', right: 'Курорт' },
                { left: 'Паттайя', right: 'Туристический центр' },
              ],
            },
            correctAnswer: { matches: { 'Бангкок': 'Столица', 'Пхукет': 'Курорт', 'Паттайя': 'Туристический центр' } },
            points: 3,
          },
          {
            type: QuestionType.TRUE_FALSE,
            order: 9,
            questionRu: 'Таиланд граничит с Вьетнамом.',
            questionEn: 'Thailand borders Vietnam.',
            options: {},
            correctAnswer: { answer: false },
            points: 1,
          },
          {
            type: QuestionType.SINGLE_CHOICE,
            order: 10,
            questionRu: 'Какая валюта используется в Таиланде?',
            questionEn: 'What currency is used in Thailand?',
            options: {
              choices: [
                { id: '1', text: 'Доллар' },
                { id: '2', text: 'Бат' },
                { id: '3', text: 'Рупия' },
                { id: '4', text: 'Донг' },
              ],
            },
            correctAnswer: { answer: '2' },
            points: 1,
          },
          {
            type: QuestionType.SHORT_TEXT,
            order: 11,
            questionRu: 'Назовите основной закон, регулирующий права иностранцев на недвижимость',
            questionEn: 'Name the main law regulating foreign property rights',
            options: {},
            correctAnswer: { answer: 'Foreign Investment Act' },
            points: 2,
          },
          {
            type: QuestionType.MULTIPLE_CHOICE,
            order: 12,
            questionRu: 'Какие типы недвижимости доступны иностранцам?',
            questionEn: 'What types of property are available to foreigners?',
            options: {
              choices: [
                { id: '1', text: 'Кондоминиумы' },
                { id: '2', text: 'Виллы' },
                { id: '3', text: 'Земля (через компанию)' },
                { id: '4', text: 'Долгосрочная аренда' },
              ],
            },
            correctAnswer: { answers: ['1', '2', '3', '4'] },
            points: 2,
          },
          {
            type: QuestionType.TRUE_FALSE,
            order: 13,
            questionRu: 'Все сделки с недвижимостью должны быть зарегистрированы.',
            questionEn: 'All real estate transactions must be registered.',
            options: {},
            correctAnswer: { answer: true },
            points: 1,
          },
          {
            type: QuestionType.SINGLE_CHOICE,
            order: 14,
            questionRu: 'Какой процент населения исповедует буддизм?',
            questionEn: 'What percentage of population practices Buddhism?',
            options: {
              choices: [
                { id: '1', text: '70%' },
                { id: '2', text: '85%' },
                { id: '3', text: '90%' },
                { id: '4', text: '95%' },
              ],
            },
            correctAnswer: { answer: '3' },
            points: 1,
          },
          {
            type: QuestionType.SHORT_TEXT,
            order: 15,
            questionRu: 'Назовите три основных курортных региона Таиланда',
            questionEn: 'Name three main resort regions of Thailand',
            options: {},
            correctAnswer: { answer: 'Phuket, Pattaya, Samui' },
            points: 3,
          },
        ],
      },
    },
  })

  // Assign course to students
  await prisma.courseAssignment.createMany({
    data: [
      {
        courseId: course.id,
        userId: student1.id,
        assignedBy: admin.id,
        deadline: new Date('2024-02-01'),
      },
      {
        courseId: course.id,
        userId: student2.id,
        assignedBy: admin.id,
        deadline: new Date('2024-02-01'),
      },
    ],
  })

  // Create some progress
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId: course.id } },
    take: 10,
  })

  for (const lesson of lessons) {
    await prisma.lessonProgress.create({
      data: {
        lessonId: lesson.id,
        userId: student1.id,
        status: 'COMPLETED',
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        activeTime: lesson.estimatedTime * 60,
        completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    })
  }

  // Create test attempts
  await prisma.testAttempt.create({
    data: {
      testId: test.id,
      userId: student1.id,
      status: 'COMPLETED',
      score: 85,
      endTime: new Date(),
      timeSpent: 1200,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Demo accounts:')
  console.log('   - admin@demo.com / demo123')
  console.log('   - teacher@demo.com / demo123')
  console.log('   - teamlead@demo.com / demo123')
  console.log('   - student1@demo.com / demo123')
  console.log('   - student2@demo.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

