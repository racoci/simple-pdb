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
            return profile ;
          } else {
            return null;
          }
        }),
        catchError(() => of(null))
      )
    );

    forkJoin(profileRequests).subscribe(results => {
      for (const result of results) {
        if (result) {
          this.addNpc(result);
        }
      }

      // Only create the simulation if there are valid nodes
      if (this.nodes.length > 0) {
        this.simulation =     d3.forceSimulation<NpcNode, NpcLink>(this.nodes)
          .force('charge',    d3.forceManyBody().strength(-50))
          .force('center',    d3.forceCenter(width / 2, height / 2))
          // Increased collision radius to account for larger node size
          .force('collision', d3.forceCollide().radius(60))
          .force('link',      d3.forceLink<NpcNode, NpcLink>(this.links)
            .id(d => d.id)
            .distance(link => link.distance));

        this.simulationReady$.next();
      }
    });
  }

  addNpc( profile: ProfileResponse): void {
    const newNode: NpcNode = { ...profile };
    // Prefer the display name and capitalize each word for readability
    if (!newNode.profile_name && newNode.profile_name_searchable) {
      newNode.profile_name = newNode.profile_name_searchable;
    }
    if (!newNode.profile_name_searchable && newNode.profile_name) {
      newNode.profile_name_searchable = newNode.profile_name.toLowerCase();
    }
    newNode.x = Math.random() * 100 + 50;
    newNode.y = Math.random() * 100 + 50;

    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti_type, profile.mbti_type);
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
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}
