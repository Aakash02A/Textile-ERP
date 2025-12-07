# Deployment Checklist - Textile ERP System

Use this checklist when deploying the Textile ERP system to production or staging environments.

## Pre-Deployment Checklist

### 1. Environment Configuration ✅

- [ ] Create production `.env` file with secure values
- [ ] Generate strong `SECRET_KEY` (min 32 characters, random)
- [ ] Set correct `DATABASE_URL` for production database
- [ ] Configure `ALLOWED_HOSTS` / `CORS_ORIGINS` for production domain
- [ ] Set up SMTP credentials for email notifications
- [ ] Configure Redis connection for caching
- [ ] Set `DEBUG=false` in production
- [ ] Review and set appropriate `ACCESS_TOKEN_EXPIRE_HOURS`

### 2. Database Setup ✅

- [ ] PostgreSQL 14+ installed and running
- [ ] Database created: `textile_erp` (or your chosen name)
- [ ] Database user created with appropriate permissions
- [ ] Connection tested from application server
- [ ] Database backups configured (automated daily)
- [ ] Backup restoration tested
- [ ] Database maintenance plan established
- [ ] Index creation verified for all foreign keys

### 3. Security Hardening ✅

- [ ] SSL/TLS certificates obtained and configured
- [ ] HTTPS enforced for all connections
- [ ] Firewall rules configured (only necessary ports open)
- [ ] Database not directly accessible from internet
- [ ] Strong passwords set for all default users
- [ ] Admin account password changed from default
- [ ] Rate limiting configured on API endpoints
- [ ] CORS properly configured (not allowing *)
- [ ] SQL injection protection verified (SQLAlchemy ORM)
- [ ] XSS protection enabled in headers
- [ ] Content Security Policy headers set
- [ ] Security headers configured in Nginx

### 4. Application Server ✅

- [ ] Python 3.10+ installed
- [ ] Virtual environment created
- [ ] All dependencies installed from requirements.txt
- [ ] Gunicorn or Uvicorn configured as WSGI server
- [ ] Worker count configured appropriately (2-4 × CPU cores)
- [ ] Process manager configured (systemd/supervisor)
- [ ] Application auto-restart on failure enabled
- [ ] Log rotation configured
- [ ] Application logs directory created with proper permissions
- [ ] Error monitoring configured (e.g., Sentry)

### 5. Web Server (Nginx) ✅

- [ ] Nginx installed and configured
- [ ] Reverse proxy configuration tested
- [ ] Static files serving configured
- [ ] Gzip compression enabled
- [ ] Client max body size set appropriately
- [ ] Timeouts configured
- [ ] Access logs and error logs configured
- [ ] Log rotation configured
- [ ] Rate limiting configured
- [ ] SSL/TLS configuration tested (A+ rating)

### 6. Docker Deployment (if using) ✅

- [ ] Docker and Docker Compose installed
- [ ] docker-compose.yml reviewed for production settings
- [ ] Environment variables configured via .env file
- [ ] Named volumes configured for data persistence
- [ ] Health checks configured for all services
- [ ] Resource limits set (CPU, memory)
- [ ] Container auto-restart policy set
- [ ] Docker logs configured with proper rotation
- [ ] Secrets managed securely (not in image)
- [ ] Images built and tagged appropriately

### 7. Initial Data Setup ✅

- [ ] Database schema created (run migrations)
- [ ] Default roles created (admin, manager, supervisor, operator, viewer)
- [ ] Admin user created with secure password
- [ ] Company/organization data configured
- [ ] Defect types loaded
- [ ] Initial materials catalog loaded (if applicable)
- [ ] System configuration values set
- [ ] Test data removed (if any)

### 8. Monitoring & Logging ✅

- [ ] Application monitoring tool configured (e.g., New Relic, DataDog)
- [ ] Log aggregation configured (e.g., ELK stack, CloudWatch)
- [ ] Error tracking configured (e.g., Sentry, Rollbar)
- [ ] Uptime monitoring configured (e.g., Pingdom, UptimeRobot)
- [ ] Performance monitoring configured
- [ ] Database monitoring configured
- [ ] Alert rules configured for critical errors
- [ ] Alert notifications configured (email, Slack, SMS)
- [ ] Dashboard created for system metrics

### 9. Backup & Recovery ✅

- [ ] Database backup strategy defined (daily, weekly, monthly)
- [ ] Automated database backups configured
- [ ] Backup storage location configured (offsite)
- [ ] Backup retention policy defined
- [ ] Database restoration procedure documented and tested
- [ ] Application files backup configured
- [ ] Docker volumes backup configured (if using Docker)
- [ ] Disaster recovery plan documented
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined

### 10. Performance Optimization ✅

- [ ] Database indexes created for frequently queried columns
- [ ] Database query optimization completed
- [ ] Connection pooling configured
- [ ] Caching strategy implemented (Redis)
- [ ] Static file caching configured
- [ ] CDN configured for static assets (if applicable)
- [ ] Compression enabled (gzip/brotli)
- [ ] Load testing completed
- [ ] Performance bottlenecks identified and resolved
- [ ] Resource usage baselines established

### 11. Testing ✅

- [ ] Health check endpoint tested: `/health`
- [ ] API documentation accessible: `/docs`
- [ ] Authentication flow tested
- [ ] All module endpoints tested
- [ ] Integration tests passed
- [ ] Load testing completed
- [ ] Security scanning completed (OWASP ZAP, Burp Suite)
- [ ] Dependency vulnerability scan completed
- [ ] Browser compatibility tested (Chrome, Firefox, Edge, Safari)
- [ ] Mobile responsiveness tested

### 12. Documentation ✅

- [ ] Deployment procedure documented
- [ ] System architecture documented
- [ ] API documentation complete and accessible
- [ ] Database schema documented
- [ ] Configuration guide prepared
- [ ] Troubleshooting guide prepared
- [ ] User manual prepared
- [ ] Admin guide prepared
- [ ] Operations runbook created

---

## Deployment Steps

### Option A: Docker Deployment (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd Textile-ERP

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 3. Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Initialize database
docker-compose exec backend python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# 5. Create admin user
docker-compose exec backend python scripts/create_admin.py

# 6. Verify deployment
docker-compose ps
curl http://localhost/health

# 7. Run health check
python test_system.py
```

### Option B: Manual Deployment

```bash
# 1. Install system dependencies
sudo apt update
sudo apt install python3.10 python3.10-venv postgresql-14 nginx redis

# 2. Set up database
sudo -u postgres psql
CREATE DATABASE textile_erp;
CREATE USER erp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE textile_erp TO erp_user;
\q

# 3. Clone and configure application
git clone <repository-url>
cd Textile-ERP/backend
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 5. Initialize database
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# 6. Create admin user
python scripts/create_admin.py

# 7. Configure systemd service
sudo cp deploy/textile-erp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable textile-erp
sudo systemctl start textile-erp

# 8. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/textile-erp
sudo ln -s /etc/nginx/sites-available/textile-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 9. Verify deployment
curl http://localhost/health
```

---

## Post-Deployment Checklist

### 1. Verification ✅

- [ ] Health check endpoint returns 200: `curl http://your-domain/health`
- [ ] API documentation accessible: `http://your-domain:8000/docs`
- [ ] Login page loads: `http://your-domain`
- [ ] Admin login successful
- [ ] Dashboard loads with data
- [ ] All modules accessible
- [ ] API endpoints responding correctly
- [ ] Database queries executing without errors
- [ ] Logs being written correctly

### 2. User Access ✅

- [ ] User accounts created for all team members
- [ ] Roles assigned correctly
- [ ] Permissions verified for each role
- [ ] Users notified of credentials (via secure channel)
- [ ] Password change forced on first login
- [ ] Training materials provided to users

### 3. Monitoring Setup ✅

- [ ] Monitoring dashboards configured
- [ ] Alert rules tested
- [ ] Team members added to alert notifications
- [ ] On-call schedule defined
- [ ] Escalation procedures documented

### 4. Documentation ✅

- [ ] Deployment date recorded
- [ ] Server details documented
- [ ] Configuration details documented
- [ ] Access credentials secured (password manager)
- [ ] Runbook reviewed with operations team
- [ ] Change log started

### 5. Communication ✅

- [ ] Stakeholders notified of deployment
- [ ] Users notified of system availability
- [ ] Training sessions scheduled
- [ ] Support channels established
- [ ] Feedback mechanism set up

---

## Production Environment Variables

Create `.env` file with these variables:

```bash
# Application
SECRET_KEY=<generate-strong-random-key-min-32-chars>
DEBUG=false
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://erp_user:secure_password@localhost:5432/textile_erp

# API
API_V1_STR=/api
PROJECT_NAME="Textile ERP"
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Security
ACCESS_TOKEN_EXPIRE_HOURS=8
ALGORITHM=HS256

# Email (Phase 2)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@company.com

# Redis
REDIS_URL=redis://localhost:6379/0

# ML Models (Phase 3)
ML_MODEL_PATH=/app/ml_models

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/textile-erp/app.log
```

---

## Security Best Practices

### Strong SECRET_KEY Generation

```python
# Generate strong secret key
import secrets
print(secrets.token_urlsafe(32))
```

### Database Password Requirements
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words
- Unique (not used elsewhere)

### Password Policy for Users
- Minimum 10 characters
- Must include: uppercase, lowercase, number, symbol
- Password expiry: 90 days
- Cannot reuse last 5 passwords
- Account lockout after 5 failed attempts

---

## Monitoring Metrics

### Application Metrics
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (5xx responses)
- Active connections
- Queue length (Celery, if enabled)

### System Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network I/O
- Disk space

### Database Metrics
- Connection count
- Query execution time
- Cache hit rate
- Table sizes
- Index usage

### Business Metrics
- Active users
- Purchase orders created
- Stock movements
- Quality inspections completed
- Sales orders processed

---

## Rollback Procedure

If deployment fails:

1. **Stop new services**
   ```bash
   docker-compose down
   # OR
   sudo systemctl stop textile-erp
   ```

2. **Restore database backup**
   ```bash
   cat backup_before_deploy.sql | psql textile_erp
   ```

3. **Revert to previous version**
   ```bash
   git checkout <previous-version-tag>
   docker-compose up -d
   ```

4. **Verify rollback**
   ```bash
   curl http://localhost/health
   python test_system.py
   ```

5. **Document issues**
   - What went wrong?
   - Error messages
   - Logs
   - Steps taken

---

## Maintenance Schedule

### Daily
- Check system health
- Review error logs
- Monitor disk space
- Verify backups completed

### Weekly
- Review performance metrics
- Check for security updates
- Review user activity logs
- Update documentation

### Monthly
- Full system audit
- Security scan
- Performance optimization review
- Database maintenance (VACUUM, REINDEX)
- Review and archive old logs

### Quarterly
- Disaster recovery drill
- Security assessment
- Capacity planning review
- User satisfaction survey

---

## Support Contacts

**Technical Issues:**
- Primary: [Your Name] - [email] - [phone]
- Secondary: [Backup Name] - [email] - [phone]

**Business Questions:**
- Product Owner: [Name] - [email]

**Emergency (24/7):**
- On-call: [Pager/Phone number]

---

## Success Criteria

Deployment is successful when:

✅ All health checks pass
✅ System uptime > 99.5%
✅ Response time < 500ms for 95% of requests
✅ Zero data loss
✅ All users can login and access their modules
✅ No critical errors in logs
✅ Monitoring and alerts functioning
✅ Backups completing successfully

---

## Sign-Off

**Deployed by:** _________________ Date: _________

**Verified by:** _________________ Date: _________

**Approved by:** _________________ Date: _________

---

**Notes:**

