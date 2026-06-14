import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event, data } = body;
    if (!data || !data.player_id || !data.body_part) {
      return Response.json({ status: 'skipped', reason: 'missing fields' });
    }

    const { player_id, body_part } = data;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const formatDate = (d) => d.toISOString().split('T')[0];

    // Fetch injury logs for same player and body part from last 3 days
    const recentLogs = await base44.asServiceRole.entities.InjuryLog.filter({
      player_id,
      body_part,
    }, '-start_date', 20);

    // Check for 3 consecutive days
    const dateSet = new Set(
      recentLogs
        .filter((log) => {
          const d = log.start_date;
          return d === formatDate(today) || d === formatDate(yesterday) || d === formatDate(twoDaysAgo);
        })
        .map((log) => log.start_date)
    );

    if (dateSet.size < 3) {
      return Response.json({ status: 'ok', pattern: false, days: dateSet.size });
    }

    // Already alerted this body part in the last 3 days?
    const existingAlerts = await base44.asServiceRole.entities.PlayerTask.filter({
      player_id,
      category: 'general',
      source: 'pain_pattern',
      status: 'active',
    }, '-created_date', 10);

    const alreadyAlerted = existingAlerts.some(
      (task) => task.link_value === body_part
    );

    if (alreadyAlerted) {
      return Response.json({ status: 'skipped', reason: 'already alerted' });
    }

    // Create alert task
    const bodyPartLabel = body_part.charAt(0).toUpperCase() + body_part.slice(1).replace(/_/g, ' ');
    await base44.asServiceRole.entities.PlayerTask.create({
      player_id,
      title: `⚠️ Persistent Pain Detected`,
      description: `You've logged pain in your ${bodyPartLabel} for 3 days in a row. This could indicate an underlying issue. Consider consulting a trainer or physiotherapist before training again.`,
      category: 'general',
      source: 'pain_pattern',
      source_ref: body_part,
      link_type: 'general',
      link_value: body_part,
      icon: '🩺',
      xp: 0,
      status: 'active',
      created_date_ts: formatDate(today),
    });

    return Response.json({ status: 'alerted', body_part, days: 3 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});