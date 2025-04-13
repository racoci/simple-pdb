import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { ProfileResponse } from '../../personality/profile/models/profile-response.model';
import { ProfileService } from '../../personality/profile/services/profile.service';

// Define interfaces for simulation nodes and links
export interface NpcNode extends d3.SimulationNodeDatum {
  id: number;
  mbti: string;      // MBTI personality code (e.g., "INTJ")
  category: string;  // Category group (e.g., "Analyst", "Diplomat")
}

export interface NpcLink extends d3.SimulationLinkDatum<NpcNode> {
  source: NpcNode;
  target: NpcNode;
  distance: number;  // desired distance between nodes
}

export interface NpcSimulation extends d3.Simulation<NpcNode, NpcLink> {}

@Injectable({ providedIn: 'root' })
export class NpcSimulationService {
  private nodes: NpcNode[] = [];
  private links: NpcLink[] = [];
  private nextId = 0;
  public simulation!: NpcSimulation;

  // Predefined list of all MBTI types (for fallback)
  private allMbtiTypes: string[] = [
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  ];

  constructor(private profileService: ProfileService) {}

  /**
   * Initializes the simulation using random profiles from the ProfileService.
   * If no profile is available, falls back to random MBTI.
   */
  initSimulation(width: number, height: number, numProfiles: number = 3): void {
    // Use ProfileService to attempt to get numProfiles random profiles
    for (let i = 0; i < numProfiles; i++) {
      const profile: ProfileResponse | undefined = this.profileService.getRandomProfile();
      if (profile) {
        // Use profile data – prefer mbti_type; fallback to mbti_profile.
        const mbti = profile.mbti_type || profile.mbti_profile;
        // Use category from profile (or fallback)
        const category = profile.category || this.getCategoryForType(mbti);
        this.addNpc(mbti, category);
      } else {
        // If no profile available, create a fallback NPC with a random MBTI.
        const type = this.randomMbtiType();
        const cat = this.getCategoryForType(type);
        this.addNpc(type, cat);
      }
    }

    // Create the D3 force simulation with the current nodes.
    this.simulation = d3.forceSimulation<NpcNode, NpcLink>(this.nodes)
      // Repulsion force
      .force('charge', d3.forceManyBody().strength(-50))
      // Centering force
      .force('center', d3.forceCenter(width / 2, height / 2))
      // Collision force so nodes don't overlap.
      .force('collision', d3.forceCollide().radius(20))
      // Link force based on relationship strength calculated from MBTI similarity.
      .force('link', d3.forceLink<NpcNode, NpcLink>(this.links)
        .id(d => d.id)
        .distance(link => link.distance));
  }

  /** Adds a new NPC node with the given MBTI and category to the simulation. */
  addNpc(mbti: string, category: string): void {
    const newNode: NpcNode = { id: this.nextId++, mbti, category };
    // Initialize node position randomly near the center.
    newNode.x = Math.random() * 100 + 50;
    newNode.y = Math.random() * 100 + 50;

    // Create links from this node to all existing nodes.
    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti, mbti);
      // Determine desired distance: more shared letters means closer nodes.
      const dist = 200 - 40 * shared;
      this.links.push({ source: newNode, target: existing, distance: dist });
    }
    this.nodes.push(newNode);

    // Update the simulation if it has been started.
    if (this.simulation) {
      this.simulation.nodes(this.nodes);
      const linkForce = this.simulation.force<d3.ForceLink<NpcNode, NpcLink>>('link');
      if (linkForce) {
        linkForce.links(this.links);
      }
      this.simulation.alpha(1).restart();
    }
  }

  /** Stops the D3 simulation */
  stopSimulation(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  /** Returns the list of NPC nodes */
  getNodes(): NpcNode[] {
    return this.nodes;
  }

  // --- Helper methods ---

  /** Picks a random MBTI type from the list. */
  private randomMbtiType(): string {
    const idx = Math.floor(Math.random() * this.allMbtiTypes.length);
    return this.allMbtiTypes[idx];
  }

  /**
   * Determines a category grouping for a given MBTI type for visual purposes.
   * (Analyst, Diplomat, Sentinel, Explorer)
   */
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

  /** Counts how many letters are shared between two MBTI strings. */
  private sharedLetters(typeA: string, typeB: string): number {
    let count = 0;
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}
