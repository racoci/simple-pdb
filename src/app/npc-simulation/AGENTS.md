# AGENTS: NPC Simulation

This component visualizes personality profiles using a D3 force simulation.

- Keep `NpcSimulationComponent` standalone and driven by `NpcSimulationService`.
- Nodes display circular images and MBTI labels; preserve the clip-path logic.
- Searching characters relies on `ProfileService`; maintain current search flow.
- Future changes should not break the existing D3 tick updates or node click navigation.
