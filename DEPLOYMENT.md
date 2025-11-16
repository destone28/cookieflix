# Cookieflix - Guida al Deployment in Produzione

Questa guida fornisce istruzioni complete per il deployment di Cookieflix in produzione.

## 📋 Indice

1. [Prerequisiti](#prerequisiti)
2. [Preparazione Server](#preparazione-server)
3. [Configurazione Ambiente](#configurazione-ambiente)
4. [Deploy con Docker](#deploy-con-docker)
5. [Configurazione SSL](#configurazione-ssl)
6. [Monitoraggio e Manutenzione](#monitoraggio-e-manutenzione)
7. [Backup e Ripristino](#backup-e-ripristino)
8. [Risoluzione Problemi](#risoluzione-problemi)

---

## Prerequisiti

### Server Requirements
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Minimo 2GB (consigliato 4GB)
- **CPU**: 2 cores (consigliato 4 cores)
- **Disco**: Minimo 20GB SSD
- **Rete**: Porta 80 (HTTP) e 443 (HTTPS) aperte

### Software Richiesto
- Docker 20.10+
- Docker Compose 2.0+
- Git
- (Opzionale) Nginx se non si usa il container

### Account Esterni
- **Stripe**: Account con API keys ([dashboard.stripe.com](https://dashboard.stripe.com))
- **Email**: Account SMTP (Gmail, SendGrid, ecc.)
- **DNS**: Dominio configurato (es. cookieflix.com)

---

## Preparazione Server

### 1. Aggiorna il Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installa Docker

```bash
# Installa dipendenze
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Aggiungi repository Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installa Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Avvia Docker
sudo systemctl start docker
sudo systemctl enable docker

# Aggiungi utente al gruppo docker (logout/login richiesto)
sudo usermod -aG docker $USER
```

### 3. Verifica Installazione

```bash
docker --version
docker compose version
```

---

## Configurazione Ambiente

### 1. Clona il Repository

```bash
git clone https://github.com/your-username/cookieflix.git
cd cookieflix
```

### 2. Crea File .env

```bash
cp .env.example .env
nano .env
```

### 3. Configura Variabili Critiche

Modifica `.env` con i valori corretti:

```env
# SECURITY - CRITICAL!
SECRET_KEY=<genera-una-chiave-sicura-qui>  # python -c "import secrets; print(secrets.token_urlsafe(32))"
ENVIRONMENT=production
DEBUG=False

# DATABASE (PostgreSQL consigliato per produzione)
DB_USER=cookieflix
DB_PASSWORD=<password-sicura>
DB_NAME=cookieflix
DATABASE_URL=postgresql://cookieflix:<password>@db:5432/cookieflix

# STRIPE
STRIPE_API_KEY=sk_live_<your-live-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>

# FRONTEND
FRONTEND_URL=https://cookieflix.com
ADMIN_FRONTEND_URL=https://admin.cookieflix.com
ALLOWED_ORIGINS=https://cookieflix.com,https://admin.cookieflix.com

# EMAIL
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SENDER=noreply@cookieflix.com
EMAIL_PASSWORD=<app-password>
ADMIN_EMAIL=admin@cookieflix.com
```

### 4. Genera SECRET_KEY Sicuro

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Deploy con Docker

### 1. Build e Avvio Servizi

```bash
# Usando lo script di deploy (consigliato)
./deploy.sh
# Seleziona opzione 8: "Build and start"

# Oppure manualmente
docker compose up -d --build
```

### 2. Verifica Stato Servizi

```bash
docker compose ps
```

Dovresti vedere:
- `cookieflix-db` (PostgreSQL) - running
- `cookieflix-backend` (FastAPI) - running
- `cookieflix-nginx` (Nginx) - running
- `cookieflix-certbot` (Certbot) - running

### 3. Visualizza Logs

```bash
# Tutti i servizi
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo database
docker compose logs -f db
```

### 4. Crea Admin User

```bash
./deploy.sh
# Seleziona opzione 6: "Create admin user"

# Oppure manualmente
docker compose exec backend python enable_admin.py
```

---

## Configurazione SSL

### Metodo 1: Let's Encrypt con Certbot (Consigliato)

#### 1. Modifica nginx/conf.d/cookieflix.conf

Uncommenta la sezione HTTPS e sostituisci `your-domain.com` con il tuo dominio effettivo.

#### 2. Ottieni Certificato SSL

```bash
# Prima richiesta del certificato
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d cookieflix.com \
  -d admin.cookieflix.com \
  --email admin@cookieflix.com \
  --agree-tos \
  --no-eff-email

# Riavvia Nginx
docker compose restart nginx
```

#### 3. Auto-Rinnovo

Il container Certbot è configurato per rinnovare automaticamente i certificati ogni 12 ore.

### Metodo 2: Certificato Personalizzato

Se hai già un certificato SSL:

1. Copia i file in `./ssl/`:
   ```bash
   mkdir -p ssl
   cp your-cert.crt ssl/
   cp your-key.key ssl/
   ```

2. Modifica `nginx/conf.d/cookieflix.conf`:
   ```nginx
   ssl_certificate /etc/nginx/ssl/your-cert.crt;
   ssl_certificate_key /etc/nginx/ssl/your-key.key;
   ```

3. Aggiungi volume in `docker-compose.yml`:
   ```yaml
   nginx:
     volumes:
       - ./ssl:/etc/nginx/ssl:ro
   ```

---

## Monitoraggio e Manutenzione

### Health Checks

```bash
# API backend
curl http://localhost:8000/api/health

# Admin panel
curl http://localhost:8000/api/admin/public-health

# Nginx
curl http://localhost/health
```

### Visualizza Metriche

```bash
# Utilizzo risorse container
docker stats

# Spazio disco
df -h

# Logs applicazione
docker compose logs -f --tail=100 backend
```

### Aggiornamento Applicazione

```bash
# 1. Backup database
./deploy.sh  # Opzione 7: "Backup database"

# 2. Pull ultime modifiche
git pull origin main

# 3. Rebuild e restart
./deploy.sh  # Opzione 8: "Build and start"

# 4. Run migrations (se necessario)
./deploy.sh  # Opzione 5: "Run database migrations"
```

---

## Backup e Ripristino

### Backup Automatico Database

```bash
# Backup manuale
./deploy.sh  # Opzione 7

# Oppure
docker compose exec -T db pg_dump -U cookieflix cookieflix > backup_$(date +%Y%m%d).sql
```

### Backup Automatico con Cron

```bash
# Aggiungi a crontab
crontab -e

# Backup giornaliero alle 2:00 AM
0 2 * * * cd /path/to/cookieflix && docker compose exec -T db pg_dump -U cookieflix cookieflix > /backups/cookieflix_$(date +\%Y\%m\%d).sql
```

### Ripristino Database

```bash
# Ripristina da backup
docker compose exec -T db psql -U cookieflix cookieflix < backup_20250116.sql
```

### Backup Files Upload

```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Ripristino
tar -xzf uploads_backup_20250116.tar.gz
```

---

## Risoluzione Problemi

### Problema: Container non si avvia

**Soluzione:**
```bash
# Visualizza logs dettagliati
docker compose logs backend

# Verifica variabili ambiente
docker compose config

# Ricrea container
docker compose down
docker compose up -d --force-recreate
```

### Problema: Database connection refused

**Soluzione:**
```bash
# Verifica stato database
docker compose ps db

# Controlla logs database
docker compose logs db

# Riavvia database
docker compose restart db
```

### Problema: Nginx 502 Bad Gateway

**Soluzione:**
```bash
# Verifica backend è attivo
docker compose ps backend
curl http://localhost:8000/api/health

# Controlla logs nginx
docker compose logs nginx

# Riavvia nginx
docker compose restart nginx
```

### Problema: Upload file non funziona

**Soluzione:**
```bash
# Verifica permessi directory
ls -la uploads/

# Ricrea directory con permessi corretti
sudo chown -R 1000:1000 uploads/
sudo chmod -R 755 uploads/
```

### Problema: Out of memory

**Soluzione:**
```bash
# Aumenta memoria swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Pulisci container inutilizzati
docker system prune -a
```

---

## Checklist Pre-Produzione

- [ ] SECRET_KEY configurato (non default)
- [ ] DEBUG=False in produzione
- [ ] Database PostgreSQL configurato
- [ ] Stripe API keys configurate (live, non test)
- [ ] Email SMTP funzionante
- [ ] SSL/TLS configurato
- [ ] CORS origins configurati correttamente
- [ ] Firewall configurato (porte 80, 443)
- [ ] Backup automatici schedulati
- [ ] Monitoring configurato
- [ ] DNS configurato correttamente
- [ ] Admin user creato
- [ ] Database migration eseguita
- [ ] Upload directory con permessi corretti
- [ ] Health checks funzionanti
- [ ] Logs accessibili e rotazione configurata

---

## Sicurezza

### Best Practices

1. **Mai** committare il file `.env`
2. Usa sempre HTTPS in produzione
3. Mantieni Docker aggiornato
4. Rotazione regolare delle password
5. Monitoring degli accessi amministrativi
6. Backup regolari e testati
7. Firewall configurato (ufw/iptables)
8. Rate limiting abilitato
9. CORS configurato strettamente
10. Logs monitoring per attività sospette

### Firewall con UFW

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status
```

---

## Supporto

Per problemi o domande:
- **Issues**: GitHub Issues
- **Email**: admin@cookieflix.com
- **Documentation**: Vedi CLAUDE.md per dettagli tecnici

---

## License

Cookieflix - Cookie Cutter Subscription Service
