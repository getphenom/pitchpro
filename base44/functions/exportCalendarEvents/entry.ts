import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function formatDateToICS(dateStr, minutes = 60) {
  const d = new Date(dateStr + 'T08:00:00');
  const start = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  d.setMinutes(d.getMinutes() + minutes);
  const end = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return { start, end };
}

function buildICS(name, description, dateStr, durationMin = 60) {
  const { start, end } = formatDateToICS(dateStr, durationMin);
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@soccerapp`;
  return [
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${name}`,
    `DESCRIPTION:${description}`,
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    'END:VEVENT',
  ].join('\r\n');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];
    const profiles = await base44.entities.PlayerProfile.list();
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'No profile found' }, { status: 400 });

    const logs = await base44.entities.DailyLog.filter({ date: today });
    const dailyLog = logs[0];

    const tasks = await base44.entities.PlayerTask.filter({
      player_id: profile.id,
      status: 'active',
    });

    const events = [];

    // Add active tasks
    for (const task of tasks) {
      const desc = task.description || task.title;
      const label = task.category ? `[${task.category.toUpperCase()}] ` : '';
      events.push(buildICS(label + task.title, desc, today, 45));
    }

    // Add training drills from today's log
    const trainingCompleted = dailyLog?.training_completed || [];
    for (const drill of trainingCompleted) {
      if (drill.completed) continue;
      events.push(buildICS(
        `⚽ ${drill.drill_name || 'Training Drill'}`,
        drill.notes || `${drill.category || 'training'} drill`,
        today,
        60
      ));
    }

    // Add quests not yet completed
    const questsCompleted = dailyLog?.quests_completed || [];

    // Hydration reminder
    if ((dailyLog?.water_ml || 0) < 1000) {
      events.push(buildICS('💧 Hydration Goal', 'Drink water throughout the day — target: 8+ glasses', today, 15));
    }

    // Mental session
    if (!dailyLog?.mental_session_done) {
      events.push(buildICS('🧠 Mental Training', 'Complete your daily mental focus or visualization session', today, 20));
    }

    if (events.length === 0) {
      return Response.json({ message: 'No events to export today' });
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SoccerDevApp//Calendar//EN',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="soccer-quests-${today}.ics"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});