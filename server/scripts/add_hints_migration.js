const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database:', dbPath);
});

db.serialize(() => {
  // Check if hints column already exists
  db.all("PRAGMA table_info(Questions)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err);
      process.exit(1);
    }

    const hasHints = columns.some(col => col.name === 'hints');
    const hasPythonCode = columns.some(col => col.name === 'python_code');
    const hasSolutionFormat = columns.some(col => col.name === 'solution_format');
    const hasInitialProbe = columns.some(col => col.name === 'initial_probe');

    const migrations = [];

    if (!hasHints) {
      migrations.push("ALTER TABLE Questions ADD COLUMN hints JSON");
    }
    if (!hasPythonCode) {
      migrations.push("ALTER TABLE Questions ADD COLUMN python_code TEXT");
    }
    if (!hasSolutionFormat) {
      migrations.push("ALTER TABLE Questions ADD COLUMN solution_format TEXT");
    }
    if (!hasInitialProbe) {
      migrations.push("ALTER TABLE Questions ADD COLUMN initial_probe TEXT");
    }

    if (migrations.length === 0) {
      console.log('✓ All required columns already exist');
      db.close();
      process.exit(0);
    }

    console.log(`Running ${migrations.length} migration(s)...`);

    let completed = 0;
    migrations.forEach((migration, index) => {
      db.run(migration, (err) => {
        if (err) {
          console.error(`✗ Migration ${index + 1} failed:`, err);
          process.exit(1);
        }
        completed++;
        console.log(`✓ Migration ${index + 1}/${migrations.length} completed: ${migration}`);

        if (completed === migrations.length) {
          console.log('\n✓ All migrations completed successfully!');
          db.close();
          process.exit(0);
        }
      });
    });
  });
});
