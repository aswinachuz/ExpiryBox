const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Item = require('../models/Item');
const User = require('../models/User');

// Configure Email Transporter (Gmail App Password or SMTP)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('📧 Email alert service initialized via SMTP');
} else {
  console.log('ℹ️ Email alert service ready in simulation mode (Set EMAIL_USER & EMAIL_PASS in .env to activate live dispatch)');
}

/**
 * Send an email reminder alert
 */
const sendEmailAlert = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"ExpiryBox Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email alert to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp Webhook Notification (Twilio / Meta Cloud API / Custom Webhook)
 */
const sendWhatsAppAlert = async ({ phone, itemName, daysRemaining, provider }) => {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl || !phone) {
    return { success: false, reason: 'Webhook URL or phone not configured' };
  }

  try {
    const payload = {
      phone,
      message: `🔔 *ExpiryBox Alert*\n\nYour *${itemName}* (${provider || 'Document'}) is expiring in *${daysRemaining} day(s)*.\n\nPlease open your ExpiryBox vault to review or renew before the deadline.`,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return { success: res.ok };
  } catch (error) {
    console.error('WhatsApp dispatch error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Reconcile and dispatch automated deadline reminders
 */
const reconcileReminders = async () => {
  try {
    console.log('⏰ Running ExpiryBox deadline reconciliation engine...');
    const now = new Date();
    const items = await Item.find({ isArchived: false, isResolved: false });
    let triggeredCount = 0;

    for (const item of items) {
      if (!item.expiryDate) continue;

      const diffTime = new Date(item.expiryDate).getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Match against reminder schedule
      for (const reminder of item.reminders || []) {
        if (!reminder.isEnabled) continue;

        // If today matches or crosses the threshold and hasn't fired in the last 24h
        if (daysRemaining <= reminder.daysBefore && !reminder.isTriggered) {
          reminder.isTriggered = true;
          reminder.triggeredAt = new Date();
          triggeredCount++;

          // Log in item's activity log
          item.activityLog.push({
            action: 'reminder_sent',
            details: `Automated alert triggered: ${daysRemaining} day(s) before expiry`,
            performedBy: 'System Cron',
            timestamp: new Date(),
          });

          // Look up user email to notify
          const users = await User.find();
          const targetEmail = users.length > 0 ? users[0].email : process.env.NOTIFICATION_DEFAULT_EMAIL;

          if (targetEmail) {
            await sendEmailAlert({
              to: targetEmail,
              subject: `⚠️ Reminder: ${item.title} expires in ${daysRemaining} day(s)`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #E7E5E4; border-radius: 16px; background-color: #FAF9F6;">
                  <div style="font-size: 24px; margin-bottom: 8px;">📦 <strong>ExpiryBox Reminder</strong></div>
                  <h2 style="color: #111827; margin-top: 0;">${item.title}</h2>
                  <p style="color: #4B5563; font-size: 14px;">This is an automated alert that your tracked item is approaching its expiry or renewal deadline.</p>
                  
                  <div style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin: 16px 0;">
                    <table style="width: 100%; font-size: 13px; color: #374151;">
                      <tr><td style="padding: 4px 0; color: #9CA3AF;">Category:</td><td style="font-weight: 600;">${item.category}</td></tr>
                      <tr><td style="padding: 4px 0; color: #9CA3AF;">Owner / Assignee:</td><td style="font-weight: 600;">${item.personName || 'Household'}</td></tr>
                      <tr><td style="padding: 4px 0; color: #9CA3AF;">Provider / Authority:</td><td style="font-weight: 600;">${item.provider || '—'}</td></tr>
                      <tr><td style="padding: 4px 0; color: #9CA3AF;">Expiry Date:</td><td style="font-weight: 700; color: #B91C1C;">${new Date(item.expiryDate).toLocaleDateString()} (${daysRemaining} days left)</td></tr>
                    </table>
                  </div>

                  <p style="font-size: 12px; color: #6B7280;">Open ExpiryBox on your PC or phone to mark as renewed, snooze, or view the renewal checklist.</p>
                </div>
              `,
              text: `ExpiryBox Alert: ${item.title} is due in ${daysRemaining} day(s) on ${new Date(item.expiryDate).toLocaleDateString()}.`,
            });
          }

          // If phone number is available, attempt WhatsApp dispatch
          if (item.person && process.env.WHATSAPP_WEBHOOK_URL) {
            await sendWhatsAppAlert({
              phone: process.env.DEFAULT_ALERT_PHONE,
              itemName: item.title,
              daysRemaining,
              provider: item.provider,
            });
          }
        }
      }

      await item.save();
    }

    console.log(`✅ Deadline reconciliation finished: ${triggeredCount} reminder(s) dispatched.`);
    return { success: true, triggeredCount };
  } catch (error) {
    console.error('Error in deadline reconciliation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize Background Cron Schedule (Runs every morning at 08:00 AM)
 */
const initNotificationCron = () => {
  // Run once daily at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [Daily Cron 08:00 AM] Triggering automatic deadline checks...');
    await reconcileReminders();
  });

  console.log('⏰ Background reminder engine registered (Schedule: Daily 08:00 AM)');
};

module.exports = {
  reconcileReminders,
  sendEmailAlert,
  sendWhatsAppAlert,
  initNotificationCron,
};
