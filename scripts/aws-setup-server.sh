#!/bin/bash

# Скрипт первоначальной настройки сервера AWS EC2
# Запустите этот скрипт один раз после первого подключения к серверу
# Использование: ./aws-setup-server.sh

set -e

echo "🔧 Настройка сервера AWS EC2 для WRE LMS..."

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка, что скрипт запущен от root или с sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Запустите скрипт с sudo: sudo ./aws-setup-server.sh${NC}"
    exit 1
fi

# Обновление системы
echo -e "${GREEN}📦 Обновление системы...${NC}"
apt update && apt upgrade -y

# Установка базовых утилит
echo -e "${GREEN}📦 Установка базовых утилит...${NC}"
apt install -y curl wget git build-essential ufw

# Установка Node.js 20.x
echo -e "${GREEN}📦 Установка Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${YELLOW}⚠️  Node.js уже установлен: $(node --version)${NC}"
fi

# Установка PM2
echo -e "${GREEN}📦 Установка PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo -e "${YELLOW}⚠️  PM2 уже установлен${NC}"
fi

# Настройка автозапуска PM2
echo -e "${GREEN}⚙️  Настройка автозапуска PM2...${NC}"
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# Установка Nginx
echo -e "${GREEN}📦 Установка Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo -e "${YELLOW}⚠️  Nginx уже установлен${NC}"
fi

# Установка Certbot
echo -e "${GREEN}📦 Установка Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${YELLOW}⚠️  Certbot уже установлен${NC}"
fi

# Настройка файрвола
echo -e "${GREEN}🔥 Настройка файрвола...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Создание директории для логов
echo -e "${GREEN}📁 Создание директорий...${NC}"
mkdir -p /home/$SUDO_USER/LMS-wre/logs
chown -R $SUDO_USER:$SUDO_USER /home/$SUDO_USER/LMS-wre

# Вывод информации
echo -e "${GREEN}✅ Настройка сервера завершена!${NC}"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo "1. Клонируйте репозиторий: cd ~ && git clone https://github.com/znn-cmd/LMS-wre.git"
echo "2. Создайте файл .env с необходимыми переменными"
echo "3. Запустите: cd LMS-wre && npm install"
echo "4. Настройте базу данных (Supabase или локальный PostgreSQL)"
echo "5. Запустите: npm run build"
echo "6. Запустите: pm2 start npm --name 'wre-lms' -- start"
echo "7. Настройте Nginx (см. AWS_DEPLOY_GUIDE.md)"
echo "8. Настройте SSL: sudo certbot --nginx -d yourdomain.com"

