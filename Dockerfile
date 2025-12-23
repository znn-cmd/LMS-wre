# Dockerfile для Amvera (опционально, если Amvera использует Docker)
# Amvera может использовать этот файл для контейнеризации приложения

FROM node:20-alpine AS base

# Установка зависимостей только при необходимости
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./
RUN npm ci

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma Client и собираем Next.js
RUN npx prisma generate
RUN npm run build

# Продакшн образ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Отключаем telemetry Next.js
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Копируем Prisma Client и схему
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# В standalone режиме Next.js создает server.js в корне
CMD ["node", "server.js"]

