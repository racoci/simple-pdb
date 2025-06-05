import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { ProfileResponse } from '../../personality/profile/models/profile-response.model';
import { ProfileService } from '../../personality/profile/services/profile.service';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Added signal and influence properties as placeholders based on README requirements
export interface NpcNode extends d3.SimulationNodeDatum, ProfileResponse {
  signal?: number;      // Placeholder for signal
  influence?: number;   // Placeholder for influence
}

export interface NpcLink extends d3.SimulationLinkDatum<NpcNode> {
  source: NpcNode;
  target: NpcNode;
  distance: number;
}

export interface NpcSimulation extends d3.Simulation<NpcNode, NpcLink> {}

@Injectable({ providedIn: 'root' })
export class NpcSimulationService {
  private nodes: NpcNode[] = [];
  private links: NpcLink[] = [];
  private nextId = 0;
  public simulation!: NpcSimulation;

  public simulationReady$ = new Subject<void>();

  private allMbtiTypes: string[] = [
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  ];

  constructor(private profileService: ProfileService) {}

  initSimulation(width: number, height: number, numProfiles: number = 20): void {
    const profileRequests = Array.from({ length: numProfiles }, () =>
      this.profileService.getRandomProfile().pipe(
        map(profile => {
          if (profile && profile.mbti_type) {
            // Add placeholder values for signal and influence
            const node: NpcNode = { ...profile, signal: 0, influence: 0 };
            return node;
          } else {
            return null;
          }
        }),
        catchError(() => of(null))
      )
    );

    forkJoin(profileRequests).subscribe(results => {
      this.nodes = results.filter(node => node !== null) as NpcNode[]; // Filter out nulls and assign

      // Generate links between all valid nodes
      this.links = [];
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const shared = this.sharedLetters(this.nodes[i].mbti_type, this.nodes[j].mbti_type);
          const dist = 200 - 40 * shared;
          this.links.push({ source: this.nodes[i], target: this.nodes[j], distance: dist });
        }
      }

      // Only create the simulation if there are valid nodes
      if (this.nodes.length > 0) {
        this.simulation = d3.forceSimulation<NpcNode, NpcLink>(this.nodes)
          .force('charge', d3.forceManyBody().strength(-50))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(40))
          .force('link', d3.forceLink<NpcNode, NpcLink>(this.links)
            .id(d => String(d.id)) // Ensure ID is string for d3
            .distance(link => link.distance));

        this.simulationReady$.next();
      }
    });
  }

  // Modified addNpc to handle potential future additions correctly
  addNpc(profile: ProfileResponse): void {
    const newNode: NpcNode = { ...profile, signal: 0, influence: 0 }; // Add placeholders
    newNode.x = Math.random() * 100 + 50;
    newNode.y = Math.random() * 100 + 50;

    // Create links to existing nodes
    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti_type, newNode.mbti_type);
      const dist = 200 - 40 * shared;
      this.links.push({ source: newNode, target: existing, distance: dist });
    }
    this.nodes.push(newNode);

    if (this.simulation) {
      this.simulation.nodes(this.nodes);
      const linkForce = this.simulation.force<d3.ForceLink<NpcNode, NpcLink>>('link');
      if (linkForce) {
        linkForce.links(this.links);
      }
      this.simulation.alpha(1).restart();
    }
  }

  stopSimulation(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  getNodes(): NpcNode[] {
    return this.nodes;
  }

  private sharedLetters(typeA: string, typeB: string): number {
    let count = 0;
    if (!typeA || !typeB) return 0; // Guard against undefined types
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}

