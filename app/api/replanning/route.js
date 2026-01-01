const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');

export async function POST(req) {
  try {
    const { current_plan, progress_updates, user_availability, user_instruction } = await req.json();

    // Validate input
    if (!current_plan || !progress_updates || !user_availability) {
      return Response.json(
        { error: 'Missing required parameters: current_plan, progress_updates, user_availability' },
        { status: 400 }
      );
    }

    const prompt = `You are an adaptive planner. Given original plan + today's progress updates + optional user instructions, produce a revised schedule and explicit deltas. Output JSON.

IN: {
 "today": "${new Date().toISOString().split('T')[0]}",
 "current_plan": ${JSON.stringify(current_plan)},
 "progress_updates": ${JSON.stringify(progress_updates)},
 "user_availability": ${JSON.stringify(user_availability)},
 "user_instruction": "${user_instruction || ''}"
}

Assistant Output:

{
 "updated_plan": { ... scheduled_tasks ... },
 "changes":[
   {"task_id":"T5","action":"moved","from":"2025-11-12","to":"2025-11-15","reason":"user skipped preprocessing","impact":"+2 days"}
 ],
 "ui_action": {
   "type": "NAVIGATE",
   "payload": { "tab": "schedule", "focus": "YYYY-MM-DD" }
 },
 "predicted_completion":"YYYY-MM-DD",
 "deadline_violation": false,
 "rationale":"<concise explanation>",
 "confidence":0.0
}

Rules: 
1. Minimize movement of completed tasks. 
2. Preserve milestone acceptance_criteria. 
3. Provide impact as delta days/hours. 
4. Always include a "ui_action" if the user's request implies looking at a specific view (tabs: focus, plan, schedule, stats, settings).
5. Keep rationale very brief.`;

    // Create provider factory with automatic fallback
    const providerFactory = createDefaultProviderFactory();
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';

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

    let jsonResponse;
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
    } catch (error) {
      throw new Error('Failed to parse JSON response: ' + response.text);
    }

    return Response.json({
      ...jsonResponse,
      provider: response.providerUsed,
      attempt: response.attempt,
      model: response.model
    });
  } catch (error) {
    console.error('Error in replanning:', error);
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
