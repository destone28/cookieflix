#!/bin/bash
# Cookieflix Deployment Script

set -e

echo "🍪 Cookieflix Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure your variables"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Load environment variables
source .env

# Validate critical environment variables
if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "CHANGE_THIS_TO_A_SECURE_RANDOM_STRING_MINIMUM_32_CHARACTERS" ]; then
    echo -e "${RED}❌ Error: SECRET_KEY not configured${NC}"
    echo "Please set a secure SECRET_KEY in .env file"
    echo "You can generate one with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
    exit 1
fi

# Function to show menu
show_menu() {
    echo ""
    echo "Select deployment action:"
    echo "1) Start all services"
    echo "2) Stop all services"
    echo "3) Restart all services"
    echo "4) View logs"
    echo "5) Run database migrations"
    echo "6) Create admin user"
    echo "7) Backup database"
    echo "8) Build and start (rebuild images)"
    echo "9) Exit"
    echo ""
}

# Function to start services
start_services() {
    echo -e "${GREEN}🚀 Starting Cookieflix services...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo "Backend API: http://localhost:8000/docs"
    echo "Health check: http://localhost:8000/api/health"
    echo "Admin panel API: http://localhost:8000/api/admin/health"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping Cookieflix services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting Cookieflix services...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Services restarted${NC}"
}

# Function to view logs
view_logs() {
    echo "Which service logs do you want to view?"
    echo "1) All services"
    echo "2) Backend only"
    echo "3) Database only"
    echo "4) Nginx only"
    read -p "Select option: " log_choice

    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f db ;;
        4) docker-compose logs -f nginx ;;
        *) echo "Invalid option" ;;
    esac
}

# Function to run migrations
run_migrations() {
    echo -e "${GREEN}🔄 Running database migrations...${NC}"
    docker-compose exec backend alembic upgrade head
    echo -e "${GREEN}✅ Migrations completed${NC}"
}

# Function to create admin user
create_admin() {
    echo -e "${GREEN}👤 Creating admin user...${NC}"
    docker-compose exec backend python enable_admin.py
    echo -e "${GREEN}✅ Admin user created/updated${NC}"
}

# Function to backup database
backup_database() {
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    BACKUP_FILE="$BACKUP_DIR/cookieflix_backup_$(date +%Y%m%d_%H%M%S).sql"

    echo -e "${GREEN}💾 Creating database backup...${NC}"
    docker-compose exec -T db pg_dump -U ${DB_USER:-cookieflix} ${DB_NAME:-cookieflix} > $BACKUP_FILE
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
}

# Function to build and start
build_and_start() {
    echo -e "${GREEN}🔨 Building images and starting services...${NC}"
    docker-compose up -d --build
    echo -e "${GREEN}✅ Build completed and services started!${NC}"
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [1-9]: " choice

    case $choice in
        1) start_services ;;
        2) stop_services ;;
        3) restart_services ;;
        4) view_logs ;;
        5) run_migrations ;;
        6) create_admin ;;
        7) backup_database ;;
        8) build_and_start ;;
        9) echo "Goodbye! 👋"; exit 0 ;;
        *) echo -e "${RED}Invalid option. Please try again.${NC}" ;;
    esac
done
