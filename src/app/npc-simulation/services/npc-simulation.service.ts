import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { ProfileResponse } from '../../personality/profile/models/profile-response.model';
import { ProfileService } from '../../personality/profile/services/profile.service';
import { forkJoin, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface NpcNode extends d3.SimulationNodeDatum {
  id: number;
  mbti: string;
  category: string;
  profile?: ProfileResponse;
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
            const mbti = profile.mbti_type?.split(" ")[0] || profile.mbti_profile;
            const category = this.mapProfileCategory(profile.category);
            return { mbti, category, profile };
          } else {
            return null;
          }
        }),
        catchError(() => of(null))
      )
    );

    forkJoin(profileRequests).subscribe(results => {
      const validResults = results.filter((result): result is { mbti: string; category: string; profile: ProfileResponse } => !!result);
      for (const result of validResults) {
        this.addNpc(result.mbti, result.category, result.profile);
      }

      // Only create the simulation if there are valid nodes
      if (this.nodes.length > 0) {
        this.simulation =     d3.forceSimulation<NpcNode, NpcLink>(this.nodes)
          .force('charge',    d3.forceManyBody().strength(-50))
          .force('center',    d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(20))
          .force('link',      d3.forceLink<NpcNode, NpcLink>(this.links)
            .id(d => d.id)
            .distance(link => link.distance));

        this.simulationReady$.next();
      }
    });
  }

  addNpc(mbti: string, category: string, profile?: ProfileResponse): void {
    const newNode: NpcNode = { id: this.nextId++, mbti, category, profile };
    newNode.x = Math.random() * 100 + 50;
    newNode.y = Math.random() * 100 + 50;

    for (const existing of this.nodes) {
      const shared = this.sharedLetters(existing.mbti, mbti);
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

  private randomMbtiType(): string {
    const idx = Math.floor(Math.random() * this.allMbtiTypes.length);
    return this.allMbtiTypes[idx];
  }

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

  private mapProfileCategory(value: string | null | undefined): string {
    const categories: Record<string, string> = {
      '1': 'Pop Culture', '2': 'Television', '3': 'Movies', '5': 'Sports', '7': 'Cartoons',
      '8': 'Anime & Manga', '9': 'Comics', '10': 'Noteworthy', '11': 'Gaming', '12': 'Literature',
      '13': 'Theatre', '14': 'Musician', '15': 'Internet', '16': 'The Arts', '17': 'Business',
      '18': 'Religion', '21': 'Science', '22': 'Historical', '26': 'Web Comics',
      '27': 'Superheroes', '28': 'Philosophy', '29': 'Kpop', '30': 'Traits',
      '31': 'Plots & Archetypes', '32': 'Concepts', '33': 'Music', '34': 'Franchises',
      '35': 'Culture', '36': 'Theories', '37': 'Polls (If you...)', '38': 'Your Experience',
      '39': 'Type Combo (Your Type)', '40': 'Ask Pdb', '41': 'PDB Community',
      '42': 'Nature', '43': 'Technology'
    };
    return (value && categories[value]) || 'Unknown';
  }

  private sharedLetters(typeA: string, typeB: string): number {
    let count = 0;
    for (let i = 0; i < 4; i++) {
      if (typeA[i] === typeB[i]) count++;
    }
    return count;
  }
}
