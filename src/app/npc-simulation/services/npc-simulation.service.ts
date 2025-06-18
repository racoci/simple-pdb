import { Injectable } from '@angular/core';
import { ProfileResponse } from '../../personality/profile/models/profile-response.model';
import { ProfileService } from '../../personality/profile/services/profile.service';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface NpcNode extends ProfileResponse {}

export interface NpcLink {
  source: NpcNode;
  target: NpcNode;
  distance: number;
}


@Injectable({ providedIn: 'root' })
export class NpcSimulationService {
  private nodes: NpcNode[] = [];
  private links: NpcLink[] = [];
  private nextId = 0;

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

      if (this.nodes.length > 0) {
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

    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti_type, profile.mbti_type);
      const dist = 200 - 40 * shared;
      this.links.push({ source: newNode, target: existing, distance: dist });
    }
    this.nodes.push(newNode);

    this.simulationReady$.next();
  }

  stopSimulation(): void {
  }

  getNodes(): NpcNode[] {
    return this.nodes;
  }

  getLinks(): NpcLink[] {
    return this.links;
  }

  private sharedLetters(typeA: string, typeB: string): number {
    let count = 0;
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}
