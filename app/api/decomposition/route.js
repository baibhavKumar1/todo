const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');

export async function POST(req) {
  try {
    const { goal_struct, max_milestones } = await req.json();

    // Validate input
    if (!goal_struct || max_milestones === undefined) {
      return Response.json(
        { error: 'Missing required parameters: goal_struct and max_milestones' },
        { status: 400 }
      );
    }

    const prompt = `You are a deterministic PM planner. Convert structured goal → ordered milestones and atomic tasks. Output only JSON.

IN: { "goal_struct": ${JSON.stringify(goal_struct)}, "max_milestones": ${max_milestones} }

Assistant Output schema:

{
  "milestones":[
    {
      "id":"M1",
      "title":"<title>",
      "description":"<what it delivers>",
      "acceptance_criteria":["..."],
      "estimate_hours": 12,
      "dependencies": ["M0"],
      "tasks":[
        {"id":"T1","title":"<short>","description":"<action>","estimate_hours":2,"priority":"high","tags":["data","prep"]}
      ]
    }
  ],
  "total_estimated_hours": 48,
  "confidence":0.0
}

Rules: keep tasks atomic (<= 4 hours). Keep estimate_hours realistic. If any milestone requires external resource not listed, add to resources_needed array.`;

    const providerFactory = createDefaultProviderFactory();
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';

    const stream = await providerFactory.generateContentStream({
      prompt: prompt,
      model: model,
      options: {
        generationConfig: {
          responseMimeType: 'application/json',
        },
      },
    });

    const encoder = new TextEncoder();
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const content = chunk.choices?.[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      },
    });

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in decomposition:', error);
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
