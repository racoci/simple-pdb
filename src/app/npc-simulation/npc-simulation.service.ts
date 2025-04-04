import { Injectable } from '@angular/core';
import * as d3 from 'd3';

// Define interfaces for our simulation nodes and links
export interface NpcNode extends d3.SimulationNodeDatum {
  id: number;
  mbti: string;      // MBTI personality code (e.g., "INTJ")
  category: string;  // category or group of the personality
}

interface NpcLink extends d3.SimulationLinkDatum<NpcNode> {
  source: NpcNode;
  target: NpcNode;
  distance: number;  // desired distance between source and target
}

@Injectable({ providedIn: 'root' })
export class NpcSimulationService {
  private nodes: NpcNode[] = [];
  private links: NpcLink[] = [];
  private nextId = 0;
  public simulation!: d3.Simulation<NpcNode, NpcLink>;

  // Predefined list of all 16 MBTI types for convenience
  private allMbtiTypes: string[] = [
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  ];

  /** Initialize the force simulation with a few random NPCs and set up forces. */
  initSimulation(width: number, height: number): void {
    // If no nodes yet, add a few random NPCs to start the simulation
    if (this.nodes.length === 0) {
      for (let i = 0; i < 3; i++) {
        const type = this.randomMbtiType();
        const category = this.getCategoryForType(type);
        this.addNpc(type, category);  // add initial NPCs
      }
    }

    // Create the D3 force simulation with the current nodes
    this.simulation = d3.forceSimulation<NpcNode, NpcLink>(this.nodes)
      // Add a charge force for repulsion (negative strength pushes nodes apart)
      .force('charge', d3.forceManyBody().strength(-50))
      // Center force to keep the graph centered in the canvas
      .force('center', d3.forceCenter(width / 2, height / 2))
      // Collision force to prevent nodes from overlapping too much (radius ~20)
      .force('collision', d3.forceCollide().radius(20))
      // Link force to link nodes with distances based on relationship strength
      .force('link', d3.forceLink<NpcNode, NpcLink>(this.links)
        .id(d => d.id)  // specify how to get id from node
        .distance(link => link.distance));
    // The simulation starts automatically and will emit "tick" events as it runs&#8203;:contentReference[oaicite:3]{index=3}.
  }

  /** Add a new NPC node with given MBTI and category to the simulation. */
  addNpc(mbti: string, category: string): void {
    // Create a new node object
    const newNode: NpcNode = { id: this.nextId++, mbti, category };
    // (Optional) initialize the node at a random position near the center
    newNode.x = Math.random() * 100 + 50;
    newNode.y = Math.random() * 100 + 50;

    // Create links from the new node to all existing nodes, with distance based on MBTI similarity
    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti, mbti);
      const dist = 200 - 40 * shared;  // closer distance if more letters in common
      this.links.push({ source: newNode, target: existing, distance: dist });
    }
    this.nodes.push(newNode);

    // If the simulation is already running, update it with the new node and links
    if (this.simulation) {
      this.simulation.nodes(this.nodes);
      const linkForce = this.simulation.force<d3.ForceLink<NpcNode, NpcLink>>('link');
      if (linkForce) {
        linkForce.links(this.links);
      }
      // "Reheat" the simulation to incorporate the new node
      this.simulation.alpha(1).restart();
    }
  }

  /** Stop the simulation loop to avoid memory leaks (e.g., when component is destroyed). */
  stopSimulation(): void {
    if (this.simulation) {
      this.simulation.stop();  // stops the internal timer for the force simulation&#8203;:contentReference[oaicite:4]{index=4}
    }
  }

  /** Get current list of nodes (useful for the component to render them). */
  getNodes(): NpcNode[] {
    return this.nodes;
  }

  // --- Helper methods ---

  /** Pick a random MBTI type from the list (for initial NPC generation). */
  private randomMbtiType(): string {
    const idx = Math.floor(Math.random() * this.allMbtiTypes.length);
    return this.allMbtiTypes[idx];
  }

  /** Determine category grouping for a given MBTI type (optional, for coloring or grouping). */
  private getCategoryForType(mbti: string): string {
    const analysts = ['INTJ','INTP','ENTJ','ENTP'];
    const diplomats = ['INFJ','INFP','ENFJ','ENFP'];
    const sentinels = ['ISTJ','ISFJ','ESTJ','ESFJ'];
    const explorers = ['ISTP','ISFP','ESTP','ESFP'];
    if (analysts.includes(mbti)) return 'Analyst';
    if (diplomats.includes(mbti)) return 'Diplomat';
    if (sentinels.includes(mbti)) return 'Sentinel';
    if (explorers.includes(mbti)) return 'Explorer';
    return 'Unknown';
  }

  /** Count how many letters two MBTI codes share (simple similarity metric). */
  private sharedLetters(typeA: string, typeB: string): number {
    let count = 0;
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}
