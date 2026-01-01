const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');

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

    const today = new Date().toISOString().split('T')[0];

    let prompt = `You are a calendar-aware scheduler. Given milestones+tasks + user availability + calendar constraints, assign each task.date (YYYY-MM-DD). Output JSON only.

IN: {
  "today": "${today}",
  "milestones": ${JSON.stringify(milestones)},
  "deadline":"${deadline}",
  "user_availability": ${JSON.stringify(user_availability)},
  "max_daily_utilization": ${max_daily_utilization}
}

Assistant Output:

{
  "scheduled_tasks":[
    {"task_id":"T1","date":"YYYY-MM-DD","estimate_hours":2}
  ],
  "predicted_completion":"YYYY-MM-DD",
  "rationale":"<short: why tasks placed this way>",
  "confidence":0.0
}

Rules:
1. Respect dependencies.
2. Do NOT exceed max_daily_utilization fraction of hours_per_day.
3. STRICTLY meet the deadline if physically possible. Compress schedule if needed.
4. Do NOT duplicate tasks. Each task ID from milestones must appear exactly once (unless split, but prefer not splitting).
5. Omit daily_capacity and utilization_summary.`;

    // Create provider factory with automatic fallback
    const providerFactory = createDefaultProviderFactory();
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';

    let attempts = 0;
    const maxAttempts = 2;
    let jsonResponse;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts} for scheduling...`);

      const response = await providerFactory.generateContent({
        prompt: prompt,
        model: model,
        options: {
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
          },
        },
      });

      try {
        // Handle markdown-wrapped JSON responses (common with OpenRouter)
        let responseText = response.text.trim();

        // Remove markdown code blocks if present
        if (responseText.startsWith('```json') && responseText.endsWith('```')) {
          responseText = responseText.slice(7, -3).trim();
        } else if (responseText.startsWith('```') && responseText.endsWith('```')) {
          responseText = responseText.slice(3, -3).trim();
        }

        jsonResponse = JSON.parse(responseText);

        // --- EVALUATOR ENGINE ---
        const errors = [];

        // 1. Check Deadline
        if (deadline && jsonResponse.predicted_completion > deadline) {
          errors.push(`Deadline violation: Predicted ${jsonResponse.predicted_completion} is after deadline ${deadline}. Compress the schedule to meet the deadline.`);
        }

        // 2. Check Duplicates
        const taskCounts = {};
        jsonResponse.scheduled_tasks.forEach(t => {
          taskCounts[t.task_id] = (taskCounts[t.task_id] || 0) + 1;
        });
        const duplicates = Object.entries(taskCounts).filter(([_, count]) => count > 1);
        if (duplicates.length > 0) {
          errors.push(`Duplicate tasks detected: ${duplicates.map(d => d[0]).join(', ')}. Ensure each task appears only once.`);
        }

        if (errors.length === 0) {
          break; // Success!
        } else {
          console.log('Validation failed:', errors);
          prompt += `\n\nCRITICAL FEEDBACK: Your previous schedule had errors: ${errors.join(' ')}. Fix them immediately and output the corrected JSON.`;
        }

      } catch (error) {
        throw new Error('Failed to parse JSON response: ' + response.text);
      }
    }

    return Response.json({
      ...jsonResponse,
      provider: 'multi-provider',
      attempt: attempts,
      model: model
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
