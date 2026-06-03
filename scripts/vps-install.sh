#!/usr/bin/env bash

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/btm26020064-stack/skills-copilot-codespaces-vscode.git}"
APP_DIR="${APP_DIR:-/root/cargo-portal}"
APP_URL="${APP_URL:-http://143.198.222.31}"
SERVER_NAME="${SERVER_NAME:-143.198.222.31}"
MYSQL_DB="${MYSQL_DB:-cargo_portal}"
MYSQL_USER="${MYSQL_USER:-cargo_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-$(openssl rand -base64 18 | tr -d '=+/')}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 36 | tr -d '=+/')}"
NODE_MAJOR="${NODE_MAJOR:-20}"
START_PORT="${START_PORT:-3000}"

MYSQL_PASSWORD="${MYSQL_PASSWORD// /}"
JWT_SECRET="${JWT_SECRET// /}"

if [[ $EUID -ne 0 ]]; then
  echo "Run this script as root: sudo bash scripts/vps-install.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "Updating system packages..."
apt update
apt install -y ca-certificates curl git nginx mysql-server openssl build-essential

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js ${NODE_MAJOR}..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2..."
  npm install -g pm2
fi

echo "Configuring MySQL database..."
systemctl enable --now mysql

mysql <<SQL
CREATE DATABASE IF NOT EXISTS ${MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';
ALTER USER '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DB}.* TO '${MYSQL_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Cloning repository to $APP_DIR..."
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "Updating existing repository..."
  git -C "$APP_DIR" pull origin main
fi

cd "$APP_DIR"

cat > .env <<EOF
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@127.0.0.1:3306/${MYSQL_DB}"
JWT_SECRET="${JWT_SECRET}"
APP_URL="${APP_URL}"
EOF

mkdir -p public/uploads/documents public/uploads/applications public/uploads/pdfs

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Creating database tables from Prisma schema..."
npx prisma db push

echo "Seeding default users..."
npm run seed

echo "Building application..."
npm run build

cat > /etc/systemd/system/cargo-portal.service <<SERVICE
[Unit]
Description=Cargo Portal Next.js App
After=network.target mysql.service

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable cargo-portal

if [[ ! -f /etc/nginx/sites-available/cargo-portal ]]; then
  cat > /etc/nginx/sites-available/cargo-portal <<NGINX
server {
  listen 80;
  server_name ${SERVER_NAME};

  client_max_body_size 50m;

  location / {
    proxy_pass http://127.0.0.1:${START_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
fi

ln -sf /etc/nginx/sites-available/cargo-portal /etc/nginx/sites-enabled/cargo-portal
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "Starting app service..."
systemctl restart cargo-portal

cat <<DONE

Cargo Portal is installed.

Open: ${APP_URL}

Default logins:
  admin@example.com / ChangeMe123!
  client@example.com / ChangeMe123!

If you want to update later:
  cd ${APP_DIR}
  git pull origin main
  npm install
  npx prisma db push
  npm run seed
  npm run build
  systemctl restart cargo-portal
DONE