import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Map reminder types to subjects and messages
const REMINDERS = {
  morning_hydration: {
    subject: '💧 Morning Hydration Check',
    body: (name) => `Good morning ${name}! Start your day right — drink a tall glass of water (350ml) and log it in SoccerPro. Staying hydrated boosts focus and energy for training.`,
  },
  midday_training: {
    subject: '⚽ Training Quest Check-In',
    body: (name) => `Hey ${name}! Have you completed your daily training quests yet? There's still time to earn XP and keep your streak alive. Open SoccerPro and crush those drills!`,
  },
  evening_hydration: {
    subject: '🌙 Evening Hydration Reminder',
    body: (name) => `Hi ${name}, don't forget to top off your water intake before bed. You need at least 1.5L today for optimal recovery. Check your dashboard to see where you stand!`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get reminder type from payload or headers
    const body = await req.json().catch(() => ({}));
    const reminderType = body.type || body.reminder_type || 'morning_hydration';

    const reminder = REMINDERS[reminderType];
    if (!reminder) {
      return Response.json({ error: `Unknown reminder type: ${reminderType}` }, { status: 400 });
    }

    // Fetch all profiles with notifications enabled
    const profiles = await base44.asServiceRole.entities.PlayerProfile.filter({
      notifications_enabled: true,
    });

    let sent = 0;
    let skipped = 0;

    for (const profile of profiles) {
      const email = profile.notification_email;
      if (!email || !email.includes('@')) {
        skipped++;
        continue;
      }

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: reminder.subject,
          body: reminder.body(profile.player_name || 'Athlete'),
        });
        sent++;
      } catch (_) {
        skipped++;
      }
    }

    return Response.json({ status: 'ok', sent, skipped, total: profiles.length, reminder_type: reminderType });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});