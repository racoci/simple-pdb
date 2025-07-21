import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { ProfileResponse } from '../../personality/profile/models/profile-response.model';
import { ProfileService } from '../../personality/profile/services/profile.service';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface NpcNode extends d3.SimulationNodeDatum, ProfileResponse {}

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
  public nodeAdded$ = new Subject<NpcNode>();

  private width: number = 0;
  private height: number = 0;

  private allMbtiTypes: string[] = [
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  ];

  constructor(private profileService: ProfileService) {}

  initSimulation(width: number, height: number, numProfiles: number = 20): void {
    this.width = width;
    this.height = height;
    for (let i = 0; i < numProfiles; i++) {
      this.profileService.getRandomProfile().pipe(
        map(profile => {
          if (profile && profile.mbti_type) {
            return profile;
          } else {
            return null;
          }
        }),
        catchError(() => of(null))
      ).subscribe(result => {
        if (result) {
          this.addNpc(result, true); // true = emit nodeAdded$
        }
      });
    }
  }

  addNpc(profile: ProfileResponse, emitNode: boolean = false): void {
    const newNode: NpcNode = { ...profile };
    if (!newNode.profile_name && newNode.profile_name_searchable) {
      newNode.profile_name = newNode.profile_name_searchable;
    }
    if (!newNode.profile_name_searchable && newNode.profile_name) {
      newNode.profile_name_searchable = newNode.profile_name.toLowerCase();
    }
    // Start at center
    newNode.x = this.width / 2;
    newNode.y = this.height / 2;

    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti_type, profile.mbti_type);
      const dist = 200 - 40 * shared;
      this.links.push({ source: newNode, target: existing, distance: dist });
    }
    this.nodes.push(newNode);

    // Create simulation if not already created
    if (!this.simulation && this.width && this.height) {
      this.simulation = d3.forceSimulation<NpcNode, NpcLink>(this.nodes)
        .force('charge', d3.forceManyBody().strength(-50))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('collision', d3.forceCollide().radius(60))
        .force('link', d3.forceLink<NpcNode, NpcLink>(this.links)
          .id(d => d.id)
          .distance(link => link.distance));
      this.simulationReady$.next();
    }

    // Always update simulation with new nodes/links
    if (this.simulation) {
      this.simulation.nodes(this.nodes);
      const linkForce = this.simulation.force<d3.ForceLink<NpcNode, NpcLink>>('link');
      if (linkForce) {
        linkForce.links(this.links);
      }
      this.simulation.alpha(1).restart();
    }

    if (emitNode) {
      this.nodeAdded$.next(newNode);
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
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}
