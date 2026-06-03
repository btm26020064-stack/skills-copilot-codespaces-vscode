# Cargo Portal

Minimal Next.js + MySQL starter for a shipping document workflow.

## Features

- Admin and client login
- Client document uploads for arrival notice, crew list, sailing permit, manifest, and K11
- Slot application form for new ship and PC requests
- PDF generation after application submission
- Admin verification and approval flow
- Bulletin posting from the admin dashboard

## Stack

- Next.js App Router
- Prisma ORM
- MySQL
- Tailwind CSS
- PDFKit for PDF generation

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies with `npm install`.
3. Run `npx prisma migrate dev`.
4. Seed sample users with `npm run seed`.
5. Start the app with `npm run dev`.

## Default users

- Admin: `admin@example.com` / `ChangeMe123!`
- Client: `client@example.com` / `ChangeMe123!`

## VPS deployment

For a fresh Ubuntu/Debian VPS, use this flow.

1. Install system packages:
	```bash
	sudo apt update
	sudo apt install -y git curl nginx mysql-server
	```
2. Install Node.js 20:
	```bash
	curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
	sudo apt install -y nodejs
	```
3. Clone the repo and enter it:
	```bash
	git clone <your-repo-url> cargo-portal
	cd cargo-portal
	```
4. Create the app environment file:
	```bash
	cp .env.example .env
	nano .env
	```
5. Create the MySQL database and user, then set `DATABASE_URL` in `.env`.
6. Install app dependencies:
	```bash
	npm install
	```
7. Generate Prisma client and apply migrations:
	```bash
	npx prisma generate
	npx prisma migrate deploy
	```
8. Seed the default admin/client accounts:
	```bash
	npm run seed
	```
9. Build and start the app:
	```bash
	npm run build
	npm run start
	```

### Recommended production setup

Use a process manager so the app stays online after reboots:

```bash
sudo npm install -g pm2
pm2 start npm --name cargo-portal -- start
pm2 save
pm2 startup
```

Configure Nginx to proxy traffic to `http://127.0.0.1:3000` and then enable the site.

Example Nginx server block:

```nginx
server {
	listen 80;
	server_name your-domain.com;

	client_max_body_size 50m;

	location / {
		proxy_pass http://127.0.0.1:3000;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
}
```

After saving the config, run:

```bash
sudo ln -s /etc/nginx/sites-available/cargo-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Make sure `public/uploads` is writable by the app user.
