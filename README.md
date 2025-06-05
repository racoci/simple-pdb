## ✅ What we’ve already developed:

### 1. **Angular Workspace Setup**

* Set up a full Angular application with routes and modular components.

### 2. **NPC Simulation Component**

* Created `npc-simulation.component.ts` that:

  * Displays an interactive graph using **D3** with **SVG** elements.
  * Fetches real profiles using the **Personality Database API** via a `ProfileService`.
  * Each node corresponds to a real character profile with data from `/api/v1/profile/{id}`.

### 3. **Profile Service**

* `ProfileService` wraps calls to:

  * `GET /api/v1/profile/{id}`
  * `GET /api/v2/personalities/{mbti_id}/profiles?category={cat_id}&limit=n`
* Used to fetch a set of real character profiles.

### 4. **NpcSimulationService**

* Maintains simulation state using `d3-force`:

  * Nodes contain `signal`, `influence`, and `ProfileResponse` data.
  * Links represent similarity between profiles based on shared MBTI letters.
  * New nodes and edges update the simulation dynamically.
  * Simulation emits `simulationReady$` when initialized.
  * Added control over `forceManyBody`, `forceLink`, `forceCollide`, and `forceCenter`.

### 5. **Data Models**

* Created TypeScript interfaces:

  * `ProfileResponse` matching PDB API.
  * `NpcNode` (extends `ProfileResponse`)
  * `NpcLink` includes dynamic `weight` and `distance`.

### 6. **Graph Rendering**

* Each node is:

  * A group (`<g>`) with a **cropped circular image** and **text label**.
  * Text and border colors correspond to profile **category**.
* Added click handler to navigate to profile detail.
* Responsive resizing with `window.resize`.

### 7. **Socionics Relationship Color Mapping**

* Relation types (Dual, Mirror, Conflict, etc.) are derived from MBTI pairs.
* Relation types determine the **link color** using a custom saturated rainbow color scheme:

  ```json
  {
    "Conflict": "#FF0000", "Supervision": "#FF8800", "Quasi-identical": "#FFFF00",
    "Contrary": "#88FF00", "Activity": "#00FF00", "Mirror": "#00FF88",
    "Identity": "#00FFFF", "Semi-Dual": "#0088FF", "Dual": "#0000FF"
  }
  ```

---

## 🧠 Prompt for the Next AI Collaborator

We are building a **dark-themed Angular web app** that visualizes characters from the Personality Database as an interactive network graph. Each node is a real personality profile (MBTI + metadata), with simulation based on social and cognitive dynamics. Here’s what’s done and what’s left:

### ✅ Already implemented:

* Angular component with D3 simulation
* Node rendering with cropped profile image and colored labels
* `ProfileService` to get characters from PDB:

  * `/api/v1/profile/{id}` → full profile
  * `/api/v2/personalities/{mbti_id}/profiles?category={cat_id}&limit=n`
* Socionics-based color-coded edges with full type mapping
* Simulation tracks `signal`, `influence` on nodes and link `weight`
* Supports profile click → sidebar route

### 💡 Still to implement:

1. **Node Interactions**

   * Tooltip (hover) shows `influence`, `signal`, and name
   * Sidebar opens full profile info

2. **Custom Simulation Parameters**

   * UI for user-defined node/edge variables (e.g., `curiosity`, `resistance`)
   * Let user define update formulas (like `node.signal += Σ(weighted input)`)

3. **Edge Dynamics**

   * Allow directed edges with types (e.g., `influences`, `resists`)
   * Support updates over time (based on Extreme AI ideas)

4. **Graph Controls**

   * Add/remove profiles by MBTI, category, or random
   * Search bar to find and add characters
   * Show/hide edges by relation type

5. **Visual Polish**

   * Ensure cropped profile images are pixel-perfect inside SVG circles
   * Better edge rendering (e.g., curves, arrows)

6. **Socionics Relation Computation**

   * Current MBTI → Socionics mapping is static; could be abstracted as a service

7. **Advanced Features (optional but desirable)**

   * Export/import graph state
   * Save/load simulation presets
   * Timeline-based visualization of signal propagation

### API ID Mappings:

**MBTI to ID**

```json
{ "ISTJ":1, "ESTJ":2, "ISFJ":3, "ESFJ":4, "ESFP":5, "ISFP":6, "ESTP":7, "ISTP":8, "INFJ":9, "ENFJ":10, "INFP":11, "ENFP":12, "INTP":13, "ENTP":14, "INTJ":15, "ENTJ":16 }
```

**Category to ID**

```json
{ "Pop Culture":1, "Television":2, "Movies":3, "Sports":5, "Cartoons":7, "Anime & Manga":8, "Comics":9, "Noteworthy":10, "Gaming":11, "Literature":12, "Theatre":13, "Musician":14, "Internet":15, "The Arts":16, "Business":17, "Religion":18, "Science":21, "Historical":22, "Web Comics":26, "Superheroes":27, "Philosophy":28, "Kpop":29, "Traits":30, "Plots & Archetypes":31, "Concepts":32, "Music":33, "Franchises":34, "Culture":35, "Theories":36, "Polls (If you...)":37, "Your Experience":38, "Type Combo (Your Type)":39, "Ask Pdb":40, "PDB Community":41, "Nature":42, "Technology":43 }
```

Use Angular + D3. Only use official PDB APIs. Simulation must stay responsive. Ask if more API examples or features are needed.
