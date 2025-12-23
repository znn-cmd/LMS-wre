# ⚡ Быстрый старт: Развертывание на AWS EC2

## 📋 Чеклист перед началом

- [ ] Аккаунт AWS создан
- [ ] Домен куплен (или будет настроен позже)
- [ ] Supabase проект создан (или будет использоваться локальная БД)
- [ ] SSH ключ готов

---

## 🚀 Шаги развертывания (30-60 минут)

### 1. Создание EC2 инстанса (10 мин)

1. AWS Console → EC2 → Launch Instance
2. **AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t3.small (для демо)
4. **Key Pair**: Создать и скачать `.pem` файл
5. **Security Group**: 
   - SSH (22) - My IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
6. **Storage**: 20 GB
7. **Launch** → Записать Public IP

### 2. Подключение к серверу (2 мин)

**Windows (PowerShell):**
```powershell
ssh -i "путь\к\ключу.pem" ubuntu@YOUR_PUBLIC_IP
```

**Linux/Mac:**
```bash
chmod 400 ключ.pem
ssh -i ключ.pem ubuntu@YOUR_PUBLIC_IP
```

### 3. Первоначальная настройка (5 мин)

```bash
# Скачать скрипт настройки
wget https://raw.githubusercontent.com/znn-cmd/LMS-wre/main/scripts/aws-setup-server.sh
# Или скопировать содержимое scripts/aws-setup-server.sh вручную

# Сделать исполняемым и запустить
chmod +x aws-setup-server.sh
sudo ./aws-setup-server.sh
```

### 4. Клонирование и настройка проекта (10 мин)

```bash
# Клонировать репозиторий
cd ~
git clone https://github.com/znn-cmd/LMS-wre.git
cd LMS-wre

# Создать .env файл
nano .env
```

Вставьте в `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL="postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL=http://YOUR_PUBLIC_IP
NODE_ENV=production
```

### 5. Установка и сборка (5 мин)

```bash
# Установить зависимости
npm install

# Сгенерировать Prisma Client
npx prisma generate

# Собрать приложение
npm run build
```

### 6. Настройка базы данных (5 мин)

**Если Supabase:**
- Откройте Supabase Dashboard → SQL Editor
- Скопируйте содержимое `scripts/create-tables-safe.sql`
- Выполните SQL скрипт

**Если локальная PostgreSQL:**
```bash
npx prisma db push
npm run db:seed  # опционально
```

### 7. Запуск приложения (2 мин)

```bash
# Использовать ecosystem.config.js
pm2 start ecosystem.config.js
pm2 save

# Проверить статус
pm2 status
pm2 logs wre-lms
```

### 8. Настройка Nginx (5 мин)

```bash
# Скопировать конфигурацию
sudo cp nginx/wre-lms.conf /etc/nginx/sites-available/wre-lms

# Отредактировать (заменить yourdomain.com на ваш домен)
sudo nano /etc/nginx/sites-available/wre-lms

# Активировать
sudo ln -s /etc/nginx/sites-available/wre-lms /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # опционально

# Проверить и перезагрузить
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Настройка домена (10-30 мин)

#### В панели регистратора домена:

1. Найдите DNS настройки
2. Добавьте A запись:
   ```
   Type: A
   Name: @
   Value: YOUR_PUBLIC_IP
   TTL: 3600
   ```
3. Добавьте CNAME:
   ```
   Type: CNAME
   Name: www
   Value: yourdomain.com
   TTL: 3600
   ```

#### Или через AWS Route 53:

1. Route 53 → Hosted Zones → Create Hosted Zone
2. Обновите NS записи у регистратора
3. Создайте A запись с вашим IP

### 10. Настройка SSL (5 мин)

**ВАЖНО**: Дождитесь, пока DNS записи распространятся (проверьте: `nslookup yourdomain.com`)

```bash
# Получить SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot автоматически обновит Nginx конфигурацию
```

### 11. Обновление переменных окружения (2 мин)

```bash
# Обновить .env
nano .env
# Изменить: NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Перезапустить приложение
pm2 restart wre-lms
```

---

## ✅ Проверка работы

1. Откройте в браузере: `https://yourdomain.com`
2. Должна открыться страница входа
3. Проверьте логи: `pm2 logs wre-lms`

---

## 🔄 Обновление приложения

```bash
cd ~/LMS-wre
git pull
npm install
npx prisma generate
npm run build
pm2 restart wre-lms
```

Или используйте скрипт:
```bash
./scripts/aws-deploy.sh
```

---

## 🆘 Проблемы?

### Приложение не запускается
```bash
pm2 logs wre-lms --lines 50
pm2 restart wre-lms
```

### Nginx ошибки
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### SSL не работает
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

### Проверить порт
```bash
sudo netstat -tulpn | grep 3000
```

---

## 📚 Полная документация

См. `AWS_DEPLOY_GUIDE.md` для детальной информации.

---

## 💰 Стоимость

- **EC2 t3.small**: ~$15-20/месяц
- **EBS 20GB**: ~$2/месяц
- **Data Transfer**: ~$0-10/месяц
- **Итого**: ~$20-35/месяц

---

## 🎉 Готово!

Ваше приложение доступно по адресу: `https://yourdomain.com`

**Тестовые аккаунты** (после seed):
- Admin: `admin@demo.com` / `demo123`
- Teacher: `teacher@demo.com` / `demo123`
- Student: `student1@demo.com` / `demo123`

