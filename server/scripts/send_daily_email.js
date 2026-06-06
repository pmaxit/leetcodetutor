const { sequelize } = require('../src/models/Question');
const DigestService = require('../src/services/DigestService');
require('dotenv').config();

// Parse command line arguments
const args = {};
process.argv.slice(2).forEach(val => {
  const [key, value] = val.split('=');
  if (key.startsWith('--')) {
    args[key.replace('--', '')] = value;
  }
});

async function run() {
  try {
    // 1. Connect to DB
    await sequelize.authenticate();
    console.log('🔄 Connected to database.');

    // 2. Call DigestService to compile and send the digest
    const res = await DigestService.sendDailyDigest({
      day: args.day,
      session: args.session,
      email: args.email
    });

    console.log('🎉 CLI Daily Email Script successfully completed.');
    if (res.emailed) {
      console.log(`🚀 Email dispatched to ${args.email || 'puneetgirdhar.in@gmail.com'}`);
    } else {
      console.log(`📢 Local HTML preview stored at: ${res.path}`);
    }
  } catch (error) {
    console.error('❌ Script execution error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
