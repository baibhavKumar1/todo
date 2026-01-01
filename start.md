I'll design a compact, practical set of OpenAI prompt templates + a recommended tag/schema you can use across the different engines (Goal Inference, Decomposition, Scheduling, Replanning, Explainability). Each prompt is framed for the Chat API (system + user) and requires a strict JSON-only response so your backend can parse reliably.

1) Tag / field schema (canonical tags you should use everywhere)

Use these keys consistently across prompts and DB fields.

goal — original user text

objective — short one-line measurable objective (what success looks like)

metrics — array of metric objects {name, target, unit}

deadline — ISO date string

domain — domain / context tag (e.g., "ml", "bio-signal", "fitness")

resources — required resources / infra / data / people

constraints — constraints/assumptions (time, budget, tech)

milestones — array of milestone objects (see below)

milestone.id — short stable id (M1, M2...)

milestone.title — short title

milestone.description — what it achieves

milestone.acceptance_criteria — how to measure done

milestone.estimate_hours — estimated effort remaining (hours)

milestone.dependencies — array of milestone.ids

task — atomic task object (below)

task.id — T1, T2...

task.title — short title

task.description — single action to perform

task.estimate_hours — hours estimate

task.date — assigned calendar date (YYYY-MM-DD)

task.priority — high/med/low

progress_update — {task_id, date, status: ["done","partial","skipped"], percent_complete, notes}

replan.delta — description of change

explainability.memo — human readable short reasoning

confidence — [0-1] confidence score from the model

2) Prompt templates (use with OpenAI Chat API, require JSON-only output)
A. Goal Inference (System message + User)

System:
You are a strict project manager assistant. Receive a user goal text and infer a structured goal representation. Output only JSON that exactly conforms to the requested schema. Do not add commentary.

User:

IN: { "goal_text": "<user goal text>", "optional_deadline": "<YYYY-MM-DD or empty>", "user_profile": {"avg_hours_per_day": number, "workdays": ["Mon","Tue",...] } }


Assistant (instructions inside prompt):
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

Example (for few-shot inside the prompt): include 1 short example (see below).

B. Task Decomposition

System:
You are a deterministic PM planner. Convert structured goal → ordered milestones and atomic tasks. Output only JSON.

User:

IN: { "goal_struct": { ... from previous output ... }, "max_milestones": 6 }


Assistant: JSON output schema

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


Rules: keep tasks atomic (<= 4 hours). Keep estimate_hours realistic. If any milestone requires external resource not listed, add to resources_needed array.

C. Calendar Scheduling (Planner)

System:
You are a calendar-aware scheduler. Given milestones+tasks + user availability + calendar constraints, assign each task.date (YYYY-MM-DD). Output JSON only.

User:

IN: {
  "milestones": [...],
  "deadline":"YYYY-MM-DD",
  "user_availability":{"workdays":["Mon","Tue"],"hours_per_day":3, "blackouts":["YYYY-MM-DD", ...]},
  "max_daily_utilization": 0.8
}


Assistant Output:

{
  "daily_capacity": {"YYYY-MM-DD": 3, ...},
  "scheduled_tasks":[
    {"task_id":"T1","date":"YYYY-MM-DD","estimate_hours":2}
  ],
  "predicted_completion":"YYYY-MM-DD",
  "utilization_summary":[{"date":"YYYY-MM-DD","hours_scheduled":2,"hours_capacity":3}],
  "rationale":"<short: why tasks placed this way>",
  "confidence":0.0
}


Rules: respect dependencies and do not exceed max_daily_utilization fraction of hours_per_day. If impossible to meet deadline, include deadline_violation:true and suggested minimum deadline.

D. Replanning (after progress update)

System:
You are an adaptive planner. Given original plan + today's progress updates, produce a revised schedule and explicit deltas. Output JSON.

User:

IN: {
 "current_plan": {...},
 "progress_updates":[ {...progress_update objects for date T...} ],
 "user_availability": {...}
}


Assistant Output:

{
 "updated_plan": { ... scheduled_tasks ... },
 "changes":[
   {"task_id":"T5","action":"moved","from":"2025-11-12","to":"2025-11-15","reason":"user skipped preprocessing; preserves buffer before M3","impact":"+2 days"}
 ],
 "predicted_completion":"YYYY-MM-DD",
 "deadline_violation": false,
 "rationale":"<one-paragraph explanation>",
 "confidence":0.0
}


Rules: Minimize movement of completed tasks. Preserve milestone acceptance_criteria. Provide impact as delta days/hours.

E. Explainability Memo (Human readable)

System:
Produce a short PM-style memo describing a replan delta. Output JSON with memo string.

User:

IN: { "change": {...one change object...}, "audience":"user" }


Assistant Output:

{
  "memo":"<What changed; Why; Effect on deadline; Next steps; Mitigation actions>"
}


Limit memo to 2–4 sentences, factual tone.

3) Recommended OpenAI parameters

model: gpt-4o-mini / gpt-4o (choose stability vs cost)

temperature: 0.0–0.2 (low for deterministic planning)

max_tokens: 800–1200 (depending on task)

top_p: 1.0

presence_penalty: 0.0

frequency_penalty: 0.0

Use few-shot examples (1–2) inside system or user prompt to anchor formats.

4) Minimal few-shot example (embed into Goal Inference prompt)

Example IN: "Train a model to classify rabbit heartbeats in 3 weeks."
Example OUT (goal inference JSON):

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
}

5) Implementation tips (quick)

Enforce JSON parsing and validate with a JSON schema. If schema validation fails, re-prompt model with the failure and ask for corrected JSON.

Store prompts & responses with timestamps for audit/explainability.

Keep temperature low in production so planner is deterministic; use a higher temp for “regenerate creative plan” mode.

Add post-processing rules (e.g., cap any estimate_hours to user_daily_hours * 2) to avoid absurd assignments.