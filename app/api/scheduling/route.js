const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');
export const maxDuration = 300;

export async function POST(req) {
  try {
    const { milestones, deadline, user_availability, max_daily_utilization } = await req.json();

    // Validate input
    if (!milestones || !deadline || !user_availability || max_daily_utilization === undefined) {
      return Response.json(
        { error: 'Missing required parameters: milestones, deadline, user_availability, max_daily_utilization' },
        { status: 400 }
      );
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Helper: Is it a workday?
    const daysMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const activeDays = (user_availability.workdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(d => daysMap[d]);
    const isWorkday = (date) => activeDays.includes(date.getDay());

    // Flatten all tasks in order
    const allTasks = [];
    milestones.forEach(m => {
      m.tasks.forEach(t => {
        allTasks.push({ ...t, milestone_id: m.id });
      });
    });

    const scheduled_tasks = [];
    let currentDate = new Date(today);
    let dailyCapacity = (user_availability.hours_per_day || 4) * (max_daily_utilization || 0.8);
    let currentDayUsedHours = 0;

    for (const task of allTasks) {
      const taskEstimate = task.estimate_hours || 1;

      // Find the next available workday with enough space
      while (true) {
        if (isWorkday(currentDate)) {
          const remainingDaily = dailyCapacity - currentDayUsedHours;

          if (remainingDaily >= 0.5) { // Minimum slice
            const hoursToSchedule = Math.min(taskEstimate, remainingDaily);

            scheduled_tasks.push({
              task_id: task.id,
              date: currentDate.toISOString().split('T')[0],
              estimate_hours: taskEstimate
            });

            currentDayUsedHours += taskEstimate;

            // If we exceeded today's capacity, carry over to next day for NEXT task
            if (currentDayUsedHours >= dailyCapacity) {
              currentDate.setDate(currentDate.getDate() + 1);
              currentDayUsedHours = 0;
            }
            break; // Task scheduled
          } else {
            // No room left today
            currentDate.setDate(currentDate.getDate() + 1);
            currentDayUsedHours = 0;
          }
        } else {
          // Weekend/Off-day
          currentDate.setDate(currentDate.getDate() + 1);
          currentDayUsedHours = 0;
        }
      }
    }

    const predicted_completion = scheduled_tasks.length > 0
      ? scheduled_tasks[scheduled_tasks.length - 1].date
      : todayStr;

    const deadline_violation = deadline ? (predicted_completion > deadline) : false;
    const rationale = deadline_violation
      ? `Schedule exceeds deadline of ${deadline} due to capacity constraints. Completion estimated for ${predicted_completion}.`
      : `Optimized schedule based on ${dailyCapacity.toFixed(1)}h daily limit across ${user_availability.workdays?.join(', ')}.`;

    return Response.json({
      scheduled_tasks,
      predicted_completion,
      deadline_violation,
      rationale,
      confidence: 1.0,
      provider: 'deterministic-engine',
      model: 'javascript-greedy-v1'
    });
  } catch (error) {
    console.error('Error in scheduling:', error);
    return Response.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'failed'
      },
      { status: 500 }
    );
  }
}
