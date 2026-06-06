const DigestService = require('./DigestService');

class SchedulerService {
  constructor() {
    this.timer = null;
    this.hour = parseInt(process.env.CRON_HOUR || '9', 10);
    this.minute = parseInt(process.env.CRON_MINUTE || '0', 10);
    this.email = process.env.SMTP_TO || 'puneetgirdhar.in@gmail.com';
    this.enabled = process.env.ENABLE_CRON_SCHEDULER !== 'false';
  }

  start() {
    if (!this.enabled) {
      console.log('⏰ SchedulerService is disabled via ENABLE_CRON_SCHEDULER.');
      return;
    }

    console.log(`⏰ SchedulerService starting... Schedule: Daily at ${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`);
    this.scheduleNextRun();
  }

  scheduleNextRun() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(this.hour, this.minute, 0, 0);

    // If scheduled time is in the past today, schedule for tomorrow
    if (now.getTime() >= nextRun.getTime()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();
    console.log(`⏰ Next daily digest run scheduled at: ${nextRun.toLocaleString()} (in ${Math.round(delay / 1000 / 60)} minutes)`);

    this.timer = setTimeout(async () => {
      try {
        console.log('🔄 Cron triggering: Running daily digest email job...');
        const result = await DigestService.sendDailyDigest({ email: this.email });
        console.log('✅ Cron job run complete:', result);
      } catch (err) {
        console.error('❌ Error executing daily digest cron job:', err.message);
      } finally {
        this.scheduleNextRun();
      }
    }, delay);
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      console.log('⏰ SchedulerService stopped.');
    }
  }
}

module.exports = new SchedulerService();
