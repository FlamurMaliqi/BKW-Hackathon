Feature Roadmap (AI-Centric)
🔑 Core MVP Features

AI Overview Assistant

Chat/voice interface (“How’s project Alpha doing?”).

Summarizes project status, workload conflicts, upcoming risks.

Answers: Which engineers are overbooked next month?

Risk & Conflict Detection Engine

Deadline overlap alerts (from mocked DB).

Workload vs. capacity check (engineers >100%).

Absence/holiday adjustment.

Minimal Dashboard UI (Support Role)

Simple list of projects + conflicts (visual validation).

Serves as fallback to AI and for demo clarity.

🚀 Stretch Features

Voice-enabled AI (speech-to-text + TTS for assistant).

Proactive AI Alerts (“Warning: 3 projects overlap in June”).

Scenario Q&A (“What if Engineer X takes 2 more weeks off?”).

Heatmap/Gantt as Visual Answers (“Show me workload for April”).

Feature Flow (AI-first)
Project Manager

Opens app → asks AI assistant:
“Summarize my risks for the next quarter.”

Assistant replies with spoken + textual overview.

PM drills down:
“Which engineer is most overloaded?”

Assistant shows name + small heatmap/table.

Managing Director

Opens → asks: “Which major deadlines are at risk?”

AI summarizes in 3 bullet points.

Optionally visualizes with a Gantt snippet.

Engineer

Asks: “What’s my workload next week?”

AI responds with capacity % and absences factored in.

Design & Build Roadmap (Hackathon)
🔨 Prioritized Order

Mock DB Setup

Define JSON with projects, deadlines, engineers, holidays.

Include conflict scenarios (so AI can detect them).

Core Conflict Logic

Overlap detection.

Overcapacity detection.

Holiday impact.

AI Integration

Wrap core logic into an LLM prompt.

LLM must “reason” over the DB → generate natural answers.

Add voice (TTS + STT) if time allows.

Frontend Support

Minimal dashboard → fallback & visualization.

Hook up AI assistant → text & optional voice output.

Demo Polish

Prepare scripted Q&A with AI:

“How are we doing this month?”

“Which deadlines overlap?”

“Show me the workload of Alice in April.”

⏱️ Cut Plan

Keep: AI Q&A, conflict detection, simple dashboard.

Cut if short on time: Voice layer, advanced visualization.

Fallback: Even a text-only chat assistant demo + basic dashboard is strong.

Instruction Flow for Team (AI-first Hackathon)

Brainstorm (30m–1h)

Define roles: Who uses AI assistant? What’s most valuable?

Data Mocking (1-2h)

Create JSON with:

Projects {id, name, deadline, status}

Engineers {id, name, capacity}

Assignments {engineer_id, project_id, hours/week}

Absences {engineer_id, start, end}

Core Logic (4h)

Write functions: check_conflicts(), check_overcapacity(), apply_holidays().

These return clean text + structured data (e.g., JSON summaries).

AI Wrapper (4-6h)

Prompt LLM: give it DB + functions → answer natural questions.

Example prompt:
“Given this JSON of projects/resources, summarize conflicts. Always mention overlaps and overbookings.”

Frontend/Voice (6h)

Minimal UI → input/output panel.

Voice input/output (if time).

Polish & Demo Prep (2h)

Scripted Q&A with AI.

Short storytelling: chaos → ask assistant → clarity.

Visualization & Presentation Suggestions (AI-first)

Main Demo = AI Assistant

Ask: “Give me a project summary.”

AI responds → screen shows bullet points & optional charts.

Supporting Visuals

Resource heatmap (colored cells for workload).

Mini Gantt chart for deadlines.

Presentation Hook

Start: “Today project managers deal with chaos…”

Show messy spreadsheets (your input data).

Then: “Meet our AI assistant → simple, voice-enabled, proactive.”
