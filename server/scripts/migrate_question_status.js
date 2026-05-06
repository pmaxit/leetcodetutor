const { Sequelize } = require('sequelize');
require('dotenv').config({ path: __dirname + '/../../.env' });

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

(async () => {
  try {
    console.log('Starting migration...\n');
    
    // Get current columns
    const [columns] = await sequelize.query(`DESCRIBE question_status`);
    const columnNames = columns.map(c => c.Field);
    console.log('Current columns:', columnNames);

    // Add user_id if missing
    if (!columnNames.includes('user_id')) {
      await sequelize.query(`
        ALTER TABLE question_status 
        ADD COLUMN user_id INT NOT NULL DEFAULT 1
      `);
      console.log('✅ Added user_id column');
    } else {
      console.log('⏭️  user_id column already exists');
    }

    // Add user_code if missing
    if (!columnNames.includes('user_code')) {
      await sequelize.query(`
        ALTER TABLE question_status 
        ADD COLUMN user_code LONGTEXT
      `);
      console.log('✅ Added user_code column');
    } else {
      console.log('⏭️  user_code column already exists');
    }

    // Drop old PRIMARY KEY and create composite one
    const [indexes] = await sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'question_status' 
      AND CONSTRAINT_NAME = 'PRIMARY'
    `);

    if (indexes.length > 0) {
      await sequelize.query(`ALTER TABLE question_status DROP PRIMARY KEY`);
      console.log('✅ Dropped old primary key');
    }

    await sequelize.query(`
      ALTER TABLE question_status 
      ADD PRIMARY KEY (user_id, question_id)
    `);
    console.log('✅ Created composite primary key (user_id, question_id)');

    // Show final schema
    const [finalCols] = await sequelize.query(`DESCRIBE question_status`);
    console.log('\n📊 Final Schema:');
    finalCols.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Key ? `Key: ${col.Key}` : ''}`);
    });

    console.log('\n✨ Migration completed successfully!');
    await sequelize.close();
  } catch (err) {
    console.error('\n❌ Migration error:', err.message);
    process.exit(1);
  }
})();
