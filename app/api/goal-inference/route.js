const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');

export async function POST(req) {
  try {
    const { goal_text, optional_deadline, user_profile } = await req.json();

    // Validate input
    if (!goal_text) {
      return Response.json(
        { error: 'Missing required parameter: goal_text' },
        { status: 400 }
      );
    }

    const prompt = `You are a strict project manager assistant. Receive a user goal text and infer a structured goal representation. Output only JSON that exactly conforms to the requested schema. Do not add commentary.

IN: { "goal_text": "${goal_text}", "optional_deadline": "${optional_deadline || ''}", "user_profile": ${JSON.stringify(user_profile)} }

Produce JSON:

{
  "goal": "<original text>",
  "objective": "<one line measurable objective>",
  "metrics": [{"name":"<metric>","target":"<value>","unit":"<unit>"}],
  "deadline":"<YYYY-MM-DD or null>",
  "domain":"<domain tag>",
  "resources":["..."],
  "constraints":["..."],
  "assumptions":["..."],
  "confidence": 0.0
}

Quality constraints: if deadline missing, infer reasonable deadline suggestion and include "deadline_suggestion":"YYYY-MM-DD". Provide confidence (0-1).

Example IN: "Train a model to classify rabbit heartbeats in 3 weeks."
Example OUT:

{
 "goal":"Train a model to classify rabbit heartbeats",
 "objective":"Produce a classifier with test accuracy >= 90% on held-out rabbit heartbeat dataset",
 "metrics":[{"name":"accuracy","target":"0.90","unit":"fraction"}],
 "deadline":"2025-12-01",
 "domain":"ml",
 "resources":["annotated heartbeat dataset","GPU (16GB)","python, pytorch"],
 "constraints":["no additional data collection","single-GPU training"],
 "assumptions":["dataset has >=2000 labeled samples"],
 "confidence":0.87
}`;

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

    // Create a TransformStream to handle the AI response chunks
    const encoder = new TextEncoder();
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // The chunk from OpenRouter SDK is typically an object with choices[0].delta.content
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
    console.error('Error in goal-inference:', error);
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
