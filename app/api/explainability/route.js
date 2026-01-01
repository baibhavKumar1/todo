import dbConnect from '../../../lib/mongodb';
import Project from '../../../lib/models/Project';
const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');

export async function POST(req) {
  try {
    await dbConnect();
    const { change, audience, context, projectId, taskId } = await req.json();

    // Validate input
    if (!change || !audience || !projectId || !taskId) {
      return Response.json(
        { error: 'Missing required parameters: change, audience, projectId, or taskId' },
        { status: 400 }
      );
    }

    const prompt = `You are a Senior Technical Lead and Mentor. Provide actionable, high-signal guidance for a developer stuck on a task.
Output JSON with the following fields:
- "context": A 1-2 sentence explanation of why this task is strategically/technically important and its prerequisites.
- "action_plan": An array of 3-4 atomic, technical steps to complete the task.
- "ai_prompt": A highly detailed prompt the user can copy and paste into an external LLM (like ChatGPT or Claude) to get deep-dive help. It should include the project context, technical stack (Next.js, MongoDB, Mongoose, Tailwind), and the specific roadblock.

TASK DETAILS:
Title/Context: ${JSON.stringify(context)}
Roadblock/Change: ${JSON.stringify(change)}
Audience: ${audience}

Assistant Output (JSON only):`;

    // Create provider factory with automatic fallback
    const providerFactory = createDefaultProviderFactory();
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free';

    const response = await providerFactory.generateContent({
      prompt: prompt,
      model: model,
      options: {
        generationConfig: {
          responseMimeType: 'application/json',
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

    // Store in DB
    const guidance = {
      ...jsonResponse,
      generatedAt: new Date()
    };

    const project = await Project.findById(projectId);
    if (project) {
      let taskFound = false;
      for (const milestone of project.milestones) {
        const task = milestone.tasks.find(t => t.id === taskId);
        if (task) {
          task.guidance = guidance;
          taskFound = true;
          break;
        }
      }
      if (taskFound) {
        await project.save();
      }
    }

    return Response.json(guidance);
  } catch (error) {
    console.error('Error in explainability:', error);
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
