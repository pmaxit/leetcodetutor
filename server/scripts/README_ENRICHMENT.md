# LeetCode Problem Enrichment Script

This script enriches your NeetCode Cloud SQL database with full problem descriptions from LeetCode, preserving HTML formatting and downloading images.

## What It Does

For each problem in your `neetcode_tp.problems` table:
1. ✅ Converts the problem title to a LeetCode URL slug
2. 🔗 Fetches the full problem description from LeetCode's GraphQL API
3. 📸 Downloads all images and stores them locally
4. 🔄 Updates image URLs in the HTML to point to local copies
5. 💾 Updates your Cloud SQL database with the enriched description

## Prerequisites

### 1. Environment Variables

Create/update your `.env` file with Cloud SQL credentials:

```bash
# Cloud SQL Configuration
DB_DIALECT=mysql
DB_HOST=your-cloudsql-instance.cloudsql.gstatic.com
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=neetcode_tp
```

### 2. Network Access

Ensure your machine can:
- Connect to Cloud SQL (whitelist your IP in Cloud SQL connection restrictions)
- Access LeetCode.com (not blocked by firewall/VPN)
- Write to `server/public/leetcode-images/` directory

### 3. Dependencies

```bash
npm install axios
# (Already included in your project)
```

## Usage

### Verify Connection First

```bash
# Test your Cloud SQL connection
bash server/scripts/verify-cloud-sql.sh
```

Should output something like:
```
problem_count
52
```

### Run Enrichment

#### Option 1: Enrich all problems
```bash
node server/scripts/enrich-from-leetcode.js
```

#### Option 2: Limit to first 10 problems
```bash
node server/scripts/enrich-from-leetcode.js --limit 10
```

#### Option 3: Start from a specific problem
```bash
node server/scripts/enrich-from-leetcode.js --start-from "Two Sum"
```

#### Option 4: Combine options
```bash
node server/scripts/enrich-from-leetcode.js --start-from "Two Sum" --limit 15
```

## Example Output

```
🚀 LeetCode Enrichment Script
📊 Fetching problems from Cloud SQL: neetcode_tp
📈 Limit: 10

📋 Found 52 problems in database

[1/10] Two Sum
   📡 Fetching from LeetCode...
   ✅ Found: Two Sum
   📸 Found 2 image(s)
      📥 Downloading: image1.png
      ✓ Already cached: image2.png
   ✅ Updated database
   ⏳ Waiting 2.5s... ✓

[2/10] Add Two Numbers
   📡 Fetching from LeetCode...
   ...

✨ Enrichment Complete!
  ✅ Enriched: 8
  ⏭️  Skipped: 2
  ❌ Failed: 0
  📸 Images saved to: server/public/leetcode-images
```

## Important Notes

### Rate Limiting
- Script respects LeetCode with **2-5 second delays** between requests
- Safe for your account and LeetCode's servers

### Skipped Problems
- If a problem already has a description (>200 chars), it's skipped
- To re-enrich, manually clear the `statement` field in the database

### Image Handling
- Images are cached in `server/public/leetcode-images/`
- URLs in the HTML are rewritten to point to local copies
- This ensures images load even if LeetCode CDN changes

### Failed Problems
- If a title doesn't match LeetCode's slug format, enrichment fails
- You can manually update the `statement` field for these cases
- Example: "Word Ladder II" → "word-ladder-ii" (usually auto-converts)

## Troubleshooting

### Connection Error: "Authentication failed"
```
❌ Cloud SQL connection failed: ER_ACCESS_DENIED_ERROR
```
**Fix:** Verify credentials in `.env` and whitelist your IP in Cloud SQL console

### Connection Error: "Unknown database"
```
❌ Cloud SQL connection failed: ER_BAD_DB_ERROR
```
**Fix:** Ensure `DB_NAME=neetcode_tp` is correct in `.env`

### LeetCode Fetch Timeout
```
⚠️  Fetch failed: Request timeout
```
**Fix:** Try again - LeetCode might be temporarily unavailable. Check internet connection.

### Images Not Downloading
```
⚠️  Image download failed: getaddrinfo ENOTFOUND assets.leetcode.com
```
**Fix:** Check your internet connection and firewall rules

### Permission Error on Images Directory
```
❌ EACCES: permission denied
```
**Fix:** Ensure `server/public/` is writable:
```bash
chmod -R 755 server/public/
```

## Database Schema

The script updates your `problems` table:

| Column | Updated | Format |
|--------|---------|--------|
| `title` | No | (unchanged) |
| `statement` | **Yes** | Full HTML from LeetCode |
| `leetcode_url` | **Yes** | https://leetcode.com/problems/{slug}/ |
| `category` | No | (unchanged) |
| `difficulty` | No | (unchanged) |

## Verify Results

After enrichment, check your database:

```bash
# Count enriched problems (with statement > 200 chars)
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D neetcode_tp <<EOF
SELECT COUNT(*) as enriched_count FROM problems WHERE LENGTH(statement) > 200;
EOF
```

## Safety

- ✅ **Read-only on LeetCode** - Only fetches data
- ✅ **Backups first** - Always backup your database before running
- ✅ **Respectful rate limiting** - Won't trigger IP blocks
- ✅ **Incremental** - Can pause and resume without data loss

### Before Running

```bash
# Backup your database (recommended)
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD neetcode_tp > neetcode_backup.sql
```

## Advanced Usage

### Resume After Interruption

If the script stops midway, simply run it again with `--start-from`:

```bash
node server/scripts/enrich-from-leetcode.js --start-from "Problem Title"
```

It will skip already-enriched problems and continue from there.

### Check Enrichment Progress

```bash
# See which problems have been enriched
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -D neetcode_tp <<EOF
SELECT title, LENGTH(statement) as desc_length, leetcode_url 
FROM problems 
ORDER BY desc_length DESC;
EOF
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify `.env` credentials
3. Test with `--limit 1` first
4. Check `server/public/leetcode-images/` for image downloads
