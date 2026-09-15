# Backup and Restore Script for TIMEORA

## PostgreSQL-Style Backup Commands

### Backup MongoDB

```bash
# Full database backup
cd watch-store/server
mkdir -p backups/$(date +%Y%m%d)
mongodump --db timeora_watches --out backups/$(date +%Y%m%d)/

# Compress backup
cd backups && tar -czf $(date +%Y%m%d)-backup.tar.gz $(date +%Y%m%d)/
```

### Restore MongoDB

```bash
# Restore from backup
cd watch-store/server
mongorestore --db timeora_watches backups/20240101/
```

### Scheduled Backups (cron)

```bash
# Add to crontab (daily at 2AM)
0 2 * * * cd /path/to/watch-store/server && mongodump --db timeora_watches --out backups/$(date +\%Y\%m\%d)
```
