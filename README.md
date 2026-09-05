# SYNAPSE

> See what happens next.

SYNAPSE is an interactive real-world system-state simulator. It models dependencies between connected conditions, propagates changes through those relationships, and makes the resulting cascade visible instead of hiding it inside a black box.

## Why it exists

Real-world problems rarely happen in isolation. A change in one part of a system can create secondary effects elsewhere: heavy rainfall can increase drainage pressure, raise flood risk, reduce road access, disrupt transport, and affect community facilities.

SYNAPSE turns those relationships into an interactive model so people can ask a simple question: **what happens if this changes?**

## Current prototype

The first public prototype focuses on a community-resilience scenario. Users can:

- change rainfall intensity with a live control
- observe a dependency graph recalculate in real time
- see stable, elevated, and critical system states
- inspect upstream causes and downstream effects
- review a deterministic confidence indicator
- reset the scenario to baseline
- understand the cascade from a single upstream input to downstream components

The prototype deliberately separates **calculation from explanation**. The current cascade is computed by a transparent weighted dependency model; no external AI service is required for the core simulation.

## System model

```text
Input condition
      ↓
Normalization
      ↓
Weighted dependency propagation
      ↓
State transition
      ↓
Affected components
      ↓
Inspectable explanation
```

The prototype's example chain is:

```text
Rainfall → Drainage → Flood risk → Road access → Transport → Facilities
```

Each dependency has a propagation weight. Scores are calculated from the upstream state and baseline values, then classified into stable, elevated, or critical states.

## Technology

- Next.js 15
- React 19
- TypeScript
- CSS
- Vercel-ready deployment

## Local development

Requirements: Node.js 18.18+ (Node.js 20+ recommended).

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production verification:

```bash
npm run lint
npm run build
npm start
```

## Design principles

### Evidence before interpretation
A system state should be inspectable. SYNAPSE exposes the dependency path that produced a state instead of presenting an unexplained conclusion.

### Deterministic core
The current engine is deterministic. The same inputs and dependency model produce the same output, making the prototype reproducible and easy to test.

### Human-controlled scenarios
Users choose the scenario and change the input. The system responds to their experiment rather than making an autonomous operational decision.

### Progressive complexity
The prototype starts with a small understandable model. The architecture is intentionally suited to expanding toward real datasets, user-defined graphs, historical state storage, and richer scenario modeling.

## Roadmap

- [ ] User-defined system graphs
- [ ] Persistent scenarios and state history
- [ ] Real-world public datasets
- [ ] Multi-variable scenario modeling
- [ ] Comparison of baseline vs. simulated states
- [ ] Exportable scenario reports
- [ ] Accessibility and keyboard-first graph controls
- [ ] Optional grounded AI explanation layer that only explains computed evidence

## Competition context

SYNAPSE is being developed as a new project for the Global Innovation Build Challenge V2. The final submission will accurately document the functionality that is actually implemented, the technologies used, and any AI assistance or external services used during development.

## License

MIT License. See `LICENSE` when added to the repository.
