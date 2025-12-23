# 🚀 Полная инструкция по развертыванию на AWS EC2 с доменом

## Содержание
1. [Создание EC2 инстанса](#1-создание-ec2-инстанса)
2. [Подключение к серверу](#2-подключение-к-серверу)
3. [Настройка сервера](#3-настройка-сервера)
4. [Развертывание приложения](#4-развертывание-приложения)
5. [Настройка Nginx](#5-настройка-nginx)
6. [Настройка SSL (Let's Encrypt)](#6-настройка-ssl-lets-encrypt)
7. [Подключение домена](#7-подключение-домена)
8. [Настройка Supabase](#8-настройка-supabase)
9. [Автоматический деплой](#9-автоматический-деплой)
10. [Мониторинг и обслуживание](#10-мониторинг-и-обслуживание)

---

## 1. Создание EC2 инстанса

### 1.1 Регистрация в AWS

1. Перейдите на [aws.amazon.com](https://aws.amazon.com)
2. Создайте аккаунт или войдите
3. Перейдите в консоль AWS

### 1.2 Создание EC2 инстанса

1. **Перейдите в EC2 Dashboard**
   - В консоли AWS найдите "EC2" и откройте его

2. **Запустите инстанс**
   - Нажмите "Launch Instance"
   - Название: `wre-lms-server`

3. **Выберите AMI (образ)**
   - Рекомендуется: **Ubuntu Server 22.04 LTS** (64-bit x86)
   - Или: **Amazon Linux 2023**

4. **Выберите тип инстанса**
   - Для демо/тестирования: **t3.small** (2 vCPU, 2 GB RAM) - ~$15/месяц
   - Для продакшена: **t3.medium** (2 vCPU, 4 GB RAM) - ~$30/месяц
   - Для больших нагрузок: **t3.large** (2 vCPU, 8 GB RAM) - ~$60/месяц

5. **Создайте/выберите ключевую пару**
   - Нажмите "Create new key pair"
   - Имя: `wre-lms-key`
   - Тип: RSA
   - Формат: `.pem` (для Linux/Mac) или `.ppk` (для Windows/PuTTY)
   - **ВАЖНО**: Скачайте файл ключа и сохраните в безопасном месте!

6. **Настройте Security Group (группу безопасности)**
   - Название: `wre-lms-sg`
   - Добавьте правила:
     ```
     Type: SSH, Port: 22, Source: My IP (или 0.0.0.0/0 для теста)
     Type: HTTP, Port: 80, Source: 0.0.0.0/0
     Type: HTTPS, Port: 443, Source: 0.0.0.0/0
     Type: Custom TCP, Port: 3000, Source: 127.0.0.1/32 (для локального доступа)
     ```

7. **Настройте хранилище**
   - Root volume: 20 GB (минимум)
   - Тип: gp3 (SSD)
   - Можно добавить дополнительный EBS volume при необходимости

8. **Запустите инстанс**
   - Нажмите "Launch Instance"
   - Дождитесь статуса "Running"

9. **Получите публичный IP**
   - В списке инстансов найдите ваш инстанс
   - Скопируйте **Public IPv4 address** (например: `54.123.45.67`)

---

## 2. Подключение к серверу

### 2.1 Windows (PowerShell)

1. **Используйте SSH клиент**
   ```powershell
   # Если у вас есть OpenSSH (Windows 10+)
   ssh -i "C:\path\to\wre-lms-key.pem" ubuntu@YOUR_PUBLIC_IP
   
   # Или используйте PuTTY (если скачали .ppk)
   # Откройте PuTTY, введите IP, загрузите .ppk ключ в Connection > SSH > Auth
   ```

2. **При первом подключении**
   - Подтвердите подключение (введите `yes`)
   - Вы должны увидеть приглашение командной строки Ubuntu

### 2.2 Linux/Mac

```bash
chmod 400 wre-lms-key.pem
ssh -i wre-lms-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

## 3. Настройка сервера

### 3.1 Обновление системы

```bash
# Обновить список пакетов
sudo apt update && sudo apt upgrade -y

# Установить базовые утилиты
sudo apt install -y curl wget git build-essential
```

### 3.2 Установка Node.js 20.x

```bash
# Установить Node.js через NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверить версии
node --version  # Должно быть v20.x.x
npm --version
```

### 3.3 Установка PM2 (менеджер процессов)

```bash
# Установить PM2 глобально
sudo npm install -g pm2

# Настроить автозапуск PM2
pm2 startup
# Скопируйте и выполните команду, которую выведет PM2
```

### 3.4 Установка Nginx

```bash
# Установить Nginx
sudo apt install -y nginx

# Запустить и включить автозапуск
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверить статус
sudo systemctl status nginx
```

### 3.5 Установка PostgreSQL (опционально, если не используете Supabase)

```bash
# Установить PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запустить PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создать базу данных и пользователя
sudo -u postgres psql
```

В PostgreSQL консоли:
```sql
CREATE DATABASE wre_lms;
CREATE USER wre_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wre_lms TO wre_user;
\q
```

### 3.6 Установка Certbot (для SSL)

```bash
# Установить Certbot
sudo apt install -y certbot python3-certbot-nginx
```

---

## 4. Развертывание приложения

### 4.1 Клонирование репозитория

```bash
# Перейти в домашнюю директорию
cd ~

# Клонировать репозиторий
git clone https://github.com/znn-cmd/LMS-wre.git
cd LMS-wre

# Или если репозиторий приватный, используйте SSH ключ
# git clone git@github.com:znn-cmd/LMS-wre.git
```

### 4.2 Установка зависимостей

```bash
# Установить зависимости
npm install

# Если есть ошибки с Prisma, установите дополнительно
npm install -g prisma
```

### 4.3 Настройка переменных окружения

```bash
# Создать файл .env
nano .env
```

Добавьте следующие переменные:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database (Supabase PostgreSQL или локальный)
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require"

# Или для локального PostgreSQL:
# DATABASE_URL="postgresql://wre_user:your_secure_password@localhost:5432/wre_lms"

# Next.js
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# Пока домен не настроен, используйте IP:
# NEXT_PUBLIC_APP_URL=http://YOUR_PUBLIC_IP

# Node Environment
NODE_ENV=production
```

Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.4 Генерация Prisma Client

```bash
# Сгенерировать Prisma Client
npx prisma generate
```

### 4.5 Настройка базы данных

**Если используете Supabase:**
- Перейдите в Supabase Dashboard → SQL Editor
- Выполните SQL скрипт из `scripts/create-tables-safe.sql`

**Если используете локальный PostgreSQL:**
```bash
# Применить схему
npx prisma db push

# Опционально: заполнить тестовыми данными
npm run db:seed
```

### 4.6 Сборка приложения

```bash
# Собрать приложение для продакшена
npm run build
```

### 4.7 Запуск с PM2

```bash
# Запустить приложение через PM2
pm2 start npm --name "wre-lms" -- start

# Или создать ecosystem файл для лучшей конфигурации
nano ecosystem.config.js
```

Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'wre-lms',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/LMS-wre',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
```

Запустите:
```bash
pm2 start ecosystem.config.js
pm2 save
```

Проверьте статус:
```bash
pm2 status
pm2 logs wre-lms
```

---

## 5. Настройка Nginx

### 5.1 Создание конфигурации Nginx

```bash
# Создать конфигурацию для вашего домена
sudo nano /etc/nginx/sites-available/wre-lms
```

Добавьте следующую конфигурацию (замените `yourdomain.com` на ваш домен):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Логи
    access_log /var/log/nginx/wre-lms-access.log;
    error_log /var/log/nginx/wre-lms-error.log;

    # Проксирование на Next.js приложение
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Увеличить размер загружаемых файлов
    client_max_body_size 10M;
}
```

### 5.2 Активация конфигурации

```bash
# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/wre-lms /etc/nginx/sites-enabled/

# Удалить дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
```

### 5.3 Проверка работы

Откройте в браузере: `http://YOUR_PUBLIC_IP` или `http://yourdomain.com`

---

## 6. Настройка SSL (Let's Encrypt)

### 6.1 Получение SSL сертификата

**ВАЖНО**: Перед получением SSL сертификата убедитесь, что:
- Домен уже указывает на ваш сервер (см. раздел 7)
- Nginx настроен и работает
- Порты 80 и 443 открыты в Security Group

```bash
# Получить SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следовать инструкциям:
# - Введите email для уведомлений
# - Согласитесь с условиями
# - Certbot автоматически настроит Nginx
```

### 6.2 Автоматическое обновление сертификата

```bash
# Проверить автопродление
sudo certbot renew --dry-run

# Certbot автоматически обновляет сертификаты через cron
# Проверить можно командой:
sudo systemctl status certbot.timer
```

### 6.3 Обновление конфигурации Nginx

Certbot автоматически обновит конфигурацию, добавив SSL настройки. Проверьте:

```bash
sudo nano /etc/nginx/sites-available/wre-lms
```

Должна быть конфигурация с SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Остальная конфигурация...
}

# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Перезагрузите Nginx:
```bash
sudo systemctl reload nginx
```

---

## 7. Подключение домена

### 7.1 Покупка домена (если еще нет)

Популярные регистраторы:
- [Namecheap](https://www.namecheap.com)
- [GoDaddy](https://www.godaddy.com)
- [Cloudflare](https://www.cloudflare.com/products/registrar/)
- [Reg.ru](https://www.reg.ru) (для .ru доменов)

### 7.2 Настройка DNS записей

#### Вариант A: Использование AWS Route 53

1. **Создать Hosted Zone**
   - Перейдите в Route 53 в консоли AWS
   - Создайте Hosted Zone для вашего домена
   - Скопируйте NS записи

2. **Обновить NS записи у регистратора**
   - В панели регистратора домена
   - Обновите NS серверы на те, что дал Route 53

3. **Создать A запись**
   - В Route 53 создайте A запись:
     - Name: `@` (или ваш домен)
     - Type: A
     - Value: `YOUR_PUBLIC_IP`
     - TTL: 300

4. **Создать CNAME для www**
   - Name: `www`
   - Type: CNAME
   - Value: `yourdomain.com`
   - TTL: 300

#### Вариант B: Настройка через регистратора

1. **В панели управления доменом найдите DNS настройки**

2. **Добавьте A запись:**
   ```
   Type: A
   Name: @ (или yourdomain.com)
   Value: YOUR_PUBLIC_IP
   TTL: 3600
   ```

3. **Добавьте CNAME для www:**
   ```
   Type: CNAME
   Name: www
   Value: yourdomain.com
   TTL: 3600
   ```

### 7.3 Проверка DNS

```bash
# Проверить DNS записи
dig yourdomain.com
nslookup yourdomain.com

# Или онлайн: https://dnschecker.org
```

DNS изменения могут занять от нескольких минут до 48 часов.

### 7.4 Обновление переменных окружения

После подключения домена обновите `.env`:

```bash
nano .env
```

Измените:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Перезапустите приложение:
```bash
pm2 restart wre-lms
```

---

## 8. Настройка Supabase

### 8.1 Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте аккаунт или войдите
3. Создайте новый проект:
   - Название: `wre-lms`
   - Пароль базы данных: (сохраните!)
   - Регион: выберите ближайший

### 8.2 Получение ключей

1. В проекте Supabase перейдите в Settings → API
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. Перейдите в Settings → Database
4. Скопируйте **Connection string** (URI) → `DATABASE_URL`
   - Используйте **Connection pooling** для продакшена
   - Формат: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require`

### 8.3 Создание таблиц

1. В Supabase Dashboard перейдите в SQL Editor
2. Откройте файл `scripts/create-tables-safe.sql` с вашего сервера или локально
3. Скопируйте содержимое и выполните в SQL Editor
4. Проверьте, что все таблицы созданы (Database → Tables)

### 8.4 Настройка RLS (Row Level Security) - опционально

Если используете Supabase Auth, настройте политики безопасности.

### 8.5 Обновление переменных на сервере

```bash
nano .env
```

Вставьте ваши Supabase ключи и обновите приложение:
```bash
pm2 restart wre-lms
```

---

## 9. Автоматический деплой

### 9.1 Настройка GitHub Actions (опционально)

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/LMS-wre
            git pull origin main
            npm install
            npx prisma generate
            npm run build
            pm2 restart wre-lms
```

### 9.2 Ручной деплой скрипт

Создайте `deploy.sh`:

```bash
#!/bin/bash
cd ~/LMS-wre
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart wre-lms
echo "Deployment completed!"
```

Сделайте исполняемым:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 10. Мониторинг и обслуживание

### 10.1 Мониторинг PM2

```bash
# Статус приложения
pm2 status

# Логи в реальном времени
pm2 logs wre-lms

# Мониторинг ресурсов
pm2 monit

# Перезапуск
pm2 restart wre-lms

# Остановка
pm2 stop wre-lms

# Удаление из PM2
pm2 delete wre-lms
```

### 10.2 Мониторинг системы

```bash
# Использование диска
df -h

# Использование памяти
free -h

# Загрузка CPU
top
# или
htop  # (установить: sudo apt install htop)

# Логи Nginx
sudo tail -f /var/log/nginx/wre-lms-access.log
sudo tail -f /var/log/nginx/wre-lms-error.log
```

### 10.3 Автоматические обновления безопасности

```bash
# Настроить автоматические обновления безопасности
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 10.4 Резервное копирование

Создайте скрипт `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап базы данных (если локальная)
# pg_dump -U wre_user wre_lms > $BACKUP_DIR/db_$DATE.sql

# Бэкап файлов приложения
tar -czf $BACKUP_DIR/app_$DATE.tar.gz ~/LMS-wre

# Удалить старые бэкапы (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Добавьте в cron:
```bash
crontab -e
# Добавить строку:
0 2 * * * /home/ubuntu/backup.sh
```

### 10.5 Настройка файрвола (UFW)

```bash
# Установить UFW
sudo apt install -y ufw

# Разрешить SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить файрвол
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## 11. Решение проблем

### 11.1 Приложение не запускается

```bash
# Проверить логи PM2
pm2 logs wre-lms --lines 100

# Проверить переменные окружения
pm2 env 0

# Проверить порт
sudo netstat -tulpn | grep 3000
```

### 11.2 Ошибки базы данных

```bash
# Проверить подключение к Supabase
npx prisma db pull

# Проверить переменную DATABASE_URL
echo $DATABASE_URL
```

### 11.3 Nginx не работает

```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить логи
sudo tail -f /var/log/nginx/error.log

# Перезапустить
sudo systemctl restart nginx
```

### 11.4 SSL сертификат не работает

```bash
# Проверить сертификат
sudo certbot certificates

# Обновить вручную
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### 11.5 Высокое использование ресурсов

```bash
# Проверить процессы
top

# Ограничить память в PM2
# В ecosystem.config.js установите max_memory_restart: '1G'
pm2 restart wre-lms
```

---

## 12. Оптимизация производительности

### 12.1 Настройка Nginx кэширования

Добавьте в конфигурацию Nginx:

```nginx
# Кэширование статических файлов
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

### 12.2 Настройка Node.js

В `ecosystem.config.js`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NODE_OPTIONS: '--max-old-space-size=1024'
}
```

### 12.3 Использование CDN (опционально)

- Настройте Cloudflare для кэширования статических файлов
- Используйте AWS CloudFront для CDN

---

## 13. Стоимость AWS

### Примерная стоимость в месяц:

- **EC2 t3.small**: ~$15-20
- **EBS 20GB**: ~$2
- **Data Transfer**: ~$0-10 (зависит от трафика)
- **Route 53**: ~$0.50 за hosted zone + $0.40 за миллион запросов
- **Итого**: ~$20-35/месяц для демо

### Экономия:

- Используйте Reserved Instances для долгосрочного использования (-30-40%)
- Настройте CloudWatch Alarms для мониторинга
- Используйте AWS Free Tier (если доступен)

---

## 14. Дополнительные ресурсы

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

## Готово! 🎉

Ваше приложение должно быть доступно по адресу: `https://yourdomain.com`

Для входа используйте тестовые аккаунты (после seed):
- Admin: admin@demo.com / demo123
- Teacher: teacher@demo.com / demo123
- Student: student1@demo.com / demo123

---

## Быстрая справка команд

```bash
# Перезапуск приложения
pm2 restart wre-lms

# Просмотр логов
pm2 logs wre-lms

# Обновление кода
cd ~/LMS-wre && git pull && npm install && npm run build && pm2 restart wre-lms

# Проверка Nginx
sudo nginx -t && sudo systemctl reload nginx

# Обновление SSL
sudo certbot renew && sudo systemctl reload nginx
```

