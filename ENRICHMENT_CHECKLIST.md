# 🚀 Quick Start: LeetCode Enrichment

## Before Running

- [ ] Check your `.env` file has these variables:
  ```bash
  DB_DIALECT=mysql
  DB_HOST=your-instance.cloudsql.gstatic.com
  DB_USER=your_user
  DB_PASSWORD=your_password
  DB_NAME=neetcode_tp
  ```

- [ ] Whitelist your IP in Cloud SQL:
  - Go to Cloud Console → SQL Instances → Connection Security
  - Add your public IP to Authorized Networks

- [ ] Test connection:
  ```bash
  bash server/scripts/verify-cloud-sql.sh
  ```

- [ ] Backup your database (just in case!):
  ```bash
  mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD neetcode_tp > neetcode_backup_$(date +%Y%m%d).sql
  ```

## Running the Script

### Step 1: Test with 1 Problem
```bash
node server/scripts/enrich-from-leetcode.js --limit 1
```

Should show:
- ✅ Connected to Cloud SQL
- 📡 Fetching from LeetCode
- 📸 Downloading images
- ✅ Updated database

### Step 2: Enrich Your First 10
```bash
node server/scripts/enrich-from-leetcode.js --limit 10
```

### Step 3: Enrich All Remaining
```bash
node server/scripts/enrich-from-leetcode.js
```

(This takes ~20-30 minutes for 50 problems due to rate limiting)

## Verify It Worked

```bash
# Check database was updated
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD neetcode_tp -e \
  "SELECT title, LENGTH(statement) as desc_size FROM problems LIMIT 5;"
```

You should see `desc_size` > 1000 for enriched problems.

## What Gets Updated

For each problem, the script:
- ✅ Fetches full HTML description from LeetCode
- ✅ Downloads images to `server/public/leetcode-images/`
- ✅ Updates image URLs to local paths
- ✅ Sets `leetcode_url` field
- ✅ Updates `statement` field in database

## Images in Your App

The images are now served from:
```
/leetcode-images/image-name.png
```

Make sure your web server serves the `public/` directory:
```javascript
// In your Express app:
app.use(express.static(path.join(__dirname, 'public')));
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Connection fails | Check `.env` and whitelist your IP |
| Images not download | Check internet connection |
| Takes too long | It's normal! Respects 2-5s delays for politeness |
| Need to stop? | Press Ctrl+C, then resume with `--start-from "title"` |

## Next Steps

After enrichment:

1. **Refresh your app** in browser to see new descriptions
2. **Check formatting** - HTML should render correctly with proper styling
3. **Verify images** - All images should load from `/leetcode-images/`
4. **Test pagination** - Make sure UI still works with longer descriptions

## Need Help?

See `server/scripts/README_ENRICHMENT.md` for detailed documentation.

---

**Happy enriching! 🎉**
