# SYNAPSE

> **Know what to do next.**

SYNAPSE is a local-first workload planner that turns deadlines, estimated effort, priority, and the amount of time you actually have available into a realistic seven-day plan.

It is deliberately simple: **capture the work, tell SYNAPSE your available time, and get a plan you can actually follow.**

## The human problem

People can be ambitious and still get stuck at the same point: they know what they want to achieve, but a pile of goals does not tell them what action to take first.

A normal task list tells you *what* exists. A calendar tells you *when* something is due. Neither automatically answers the question that matters when several deadlines collide:

> **What should I work on next, and can all of this realistically fit?**

SYNAPSE treats a workload as a constrained planning problem rather than a collection of unchecked boxes. The interface is designed to reduce the amount of interpretation required from the user: the current workload, available capacity, schedule, pressure, and next action are visible together.

## What the product does

Users can:

- add tasks with a context, due date, estimated effort, and priority
- declare how many minutes they realistically have available per day
- automatically generate a seven-day schedule
- split large tasks across multiple days instead of cramming them into one session
- surface the next task using deadline, priority, and workload pressure
- explain **why** the surfaced task deserves attention
- see whether individual tasks are healthy, tight, or overdue relative to available time
- see when part of the workload cannot fit into the declared capacity
- mark work complete and have the schedule recalculate immediately
- switch between today's work, planned work, and the full workload
- export a plan to JSON and import it later
- keep tasks and settings saved locally in the browser

No account or external database is required for the core product.

## Human-centered interaction

SYNAPSE is intentionally built around a short decision loop:

**Capture → Understand → Act → Recalculate.**

Instead of forcing a user to interpret a large list, the product gives them a focused next action, shows the reason behind that recommendation, and makes the consequences of changing capacity or completing work visible immediately.

Motion is deliberately restrained: small transitions communicate state changes without making the interface depend on animation. The product also respects `prefers-reduced-motion` so the experience remains usable for people who reduce motion in their system settings.

The goal is not to manipulate attention. It is to **make the next useful action easier to notice and understand.**

## How the planning engine works

The core engine is deterministic and runs in the browser.

```text
Tasks
  ↓
Due date + priority + estimated effort
  ↓
Available minutes per day
  ↓
Deadline-ordered allocation
  ↓
Daily capacity check
  ↓
Split work across available days
  ↓
Seven-day executable plan
```

The planner processes unfinished work by deadline, then priority, then effort. For each task it allocates available minutes from today toward the deadline. If a task cannot fit inside the declared capacity, the product does not pretend that it fits: the remaining workload stays visible as unscheduled pressure.

This makes the result reproducible and explainable. The same tasks and capacity produce the same plan.

## Why it is different

SYNAPSE is not trying to become another giant notes app or a decorative dashboard. Its core job is **workload-to-action translation**.

The important input is not just a deadline. It is the combination of:

- **when** the work is due
- **how long** the work is expected to take
- **how important** it is
- **how much time** the user actually has

That combination lets SYNAPSE expose a practical constraint: whether the workload fits the time available.

## Privacy

The current product is local-first. Tasks and capacity are stored with browser `localStorage`; they are not sent to a SYNAPSE backend.

The product has no required account, analytics backend, or external planning API in the current prototype.

## AI assistance disclosure

AI was used as a development assistant during the creation of this prototype for brainstorming, implementation assistance, debugging support, code review, documentation, and iteration.

The final product direction, requirements, testing decisions, and submission claims are the responsibility of the project author. The deterministic planning engine is implemented as TypeScript logic and does not require an AI model or external AI API to operate.

## Technology

- Next.js 15
- React 19
- TypeScript
- CSS
- Browser Local Storage
- Browser File APIs for JSON import/export
- Vercel-ready deployment
- AI development assistance: ChatGPT

## Run locally

Requirements: Node.js 18.18+ (Node.js 20+ recommended).

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Before shipping, run:

```bash
npm run lint
npm run build
npm start
```

## Product flow

1. Add real tasks.
2. Give each task a due date and honest time estimate.
3. Set your realistic daily capacity.
4. Review the generated seven-day plan.
5. Use **What should I do now?** when you are unsure where to start.
6. Read the **Why this one?** explanation for the surfaced action.
7. Mark work complete as you go; the schedule recalculates automatically.
8. Export the plan if you want a portable backup.

## Current scope

Implemented in the current prototype:

- responsive web interface
- task creation and deletion
- completion state
- due-date handling
- priority handling
- effort estimates
- configurable daily capacity
- deterministic seven-day scheduling
- workload pressure indicators
- focus queue with recommendation rationale
- visible unscheduled-capacity warning
- local persistence
- validated JSON import/export
- responsive mobile layout
- keyboard-focusable interactive controls
- reduced-motion support
- inline status feedback for important actions

Not claimed as implemented:

- cloud synchronization
- multi-user collaboration
- calendar provider integrations
- notifications or background reminders
- machine-learning predictions
- external AI inference

## Roadmap

Potential future work includes calendar synchronization, recurring tasks, dependency-aware projects, optional accounts, and a richer constraint solver. These are roadmap items, not current capabilities.

## Competition context

SYNAPSE is being developed for the Global Innovation Build Challenge V2, Track 03: Open / General Technical Invention. The submission will describe only functionality that is actually implemented and will distinguish deterministic product logic from AI-assisted development.

## License

MIT
