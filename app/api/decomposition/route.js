const { createDefaultProviderFactory } = require('../../../lib/ai-providers/provider-factory');

export const maxDuration = 300; // Allow up to 5 mins for complex plans

export async function POST(req) {
  try {
    const { goal_struct, max_milestones, deadline, user_availability } = await req.json();

    // Validate input
    if (!goal_struct || max_milestones === undefined) {
      return Response.json(
        { error: 'Missing required parameters: goal_struct and max_milestones' },
        { status: 400 }
      );
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Server-side Budget Calculation
    let totalBudgetHours = 0;
    let budgetDetails = "";

    if (deadline && user_availability) {
      const targetDate = new Date(deadline);
      const diffTime = Math.abs(targetDate - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Basic workday calculation
      let workdaysCount = 0;
      const daysMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
      const activeDays = (user_availability.workdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(d => daysMap[d]);

      for (let i = 0; i <= diffDays; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        if (activeDays.includes(checkDate.getDay())) {
          workdaysCount++;
        }
      }

      totalBudgetHours = workdaysCount * (user_availability.hours_per_day || 4);
      budgetDetails = `${workdaysCount} workdays available, ${totalBudgetHours} total hours budget.`;
    } else {
      totalBudgetHours = 80; // Default for no deadline
      budgetDetails = "No deadline provided, assuming 80 hour budget (2 weeks).";
    }

    const safeBudget = Math.floor(totalBudgetHours * 0.85); // 15% buffer

    const prompt = `You are an expert PM. Convert this goal into milestones and tasks.
STRICT CONSTRAINT: The sum of ALL task "estimate_hours" must be LESS THAN OR EQUAL TO ${safeBudget} hours.

CONTEXT:
- Goal: ${JSON.stringify(goal_struct)}
- Available Time: ${budgetDetails}
- Target Budget: ${safeBudget} hours (including buffer).

INSTRUCTIONS:
1. Divide the workload into max ${max_milestones} milestones.
2. Each task MUST have a "description" field explaining the implementation.
3. If the goal is too complex for ${safeBudget} hours, include only high-priority core features.
4. Output valid JSON only.

Output Schema:
{
  "milestones":[
    {
      "id":"M1",
      "title":"<title>",
      "description":"<what it delivers>",
      "acceptance_criteria":["..."],
      "estimate_hours": 10,
      "tasks":[
        {"id":"T1","title":"<short>","description":"<detailed action>","estimate_hours":2,"priority":"high","tags":["tech"]}
      ]
    }
  ],
  "total_estimated_hours": 45,
  "budget_calculation": "${budgetDetails}",
  "rationale": "Briefly explain how this fits the ${safeBudget} hour constraint"
}

Rules: Task estimates must be realistic and <= 4 hours each.`;

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
      let responseText = response.text.trim();
      if (responseText.startsWith('```json')) responseText = responseText.slice(7, -3).trim();
      else if (responseText.startsWith('```')) responseText = responseText.slice(3, -3).trim();
      jsonResponse = JSON.parse(responseText);
    } catch (error) {
      throw new Error('Failed to parse decomposition JSON: ' + response.text);
    }

    return Response.json(jsonResponse);
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
