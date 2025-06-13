import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';
import {NpcNode, NpcSimulationService} from './services/npc-simulation.service';
import {ProfileService} from '../personality/profile/services/profile.service';
import {ProfileResponse} from '../personality/profile/models/profile-response.model';
import {SearchResponseProfile} from '../personality/profile/models/search-response.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-npc-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './npc-simulation.component.html',
  styleUrls: ['./npc-simulation.component.css']
})
export class NpcSimulationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<SVGSVGElement>;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoomGroup!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private zoomBehavior!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private nodeElements!: d3.Selection<SVGGElement, NpcNode, SVGGElement, unknown>;

  private readonly bubbleRadius = 25;
  private readonly nameMargin = 4;

  private width: number = 0;
  private height: number = 0;
  private resizeListener = this.onResize.bind(this);

  searchTerm = '';
  searchResults: SearchResponseProfile[] = [];
  private searchSub?: Subscription;

  hoveredProfile: NpcNode | null = null;

  constructor(
    private npcService: NpcSimulationService,
    private profileService: ProfileService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.svg = d3.select(this.svgContainer.nativeElement);
      this.width = this.svgContainer.nativeElement.clientWidth;
      this.height = this.svgContainer.nativeElement.clientHeight;
      this.svg.attr('width', this.width).attr('height', this.height);

      this.zoomGroup = this.svg.append('g');
      this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => {
          this.zoomGroup.attr('transform', event.transform);
        });

      this.svg.call(this.zoomBehavior as any);

      this.npcService.simulationReady$.subscribe(() => {
        const nodes = this.npcService.getNodes();

        this.nodeElements = this.zoomGroup.selectAll<SVGGElement, NpcNode>('g')
          .data(nodes, (d: NpcNode) => String(d.id))
          .enter()
          .append('g')
          .attr('class', 'npc-node')
          .on('click', (_event, node) => {
            const profile = node;
            if (profile) {
              this.ngZone.run(() => {
                this.router.navigate(['/profile', profile.id]).then(() => {
                  console.log('Profile clicked');
                });
              });
            }
          })
          .on('mouseover', (_event, node) => {
            this.ngZone.run(() => {
              this.hoveredProfile = node;
            });
          })
          .on('mouseout', () => {
            this.ngZone.run(() => {
              this.hoveredProfile = null;
            });
          });

        this.nodeElements.append('defs')
          .append('clipPath')
          .attr('id', d => `clip-${d.id}`)
          .append('circle')
          .attr('r', this.bubbleRadius)
          .attr('cx', 0)
          .attr('cy', 0);

        this.nodeElements.append('image')
          .attr('xlink:href', d => d.profile_image_url ?? '')
          .attr('x', -this.bubbleRadius)
          .attr('y', -this.bubbleRadius)
          .attr('width', this.bubbleRadius * 2)
          .attr('height', this.bubbleRadius * 2)
          .attr('clip-path', d => `url(#clip-${d.id})`);

        this.nodeElements.append('circle')
          .attr('r', this.bubbleRadius)
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke', d => this.getColorForCategory(d.category));

        this.nodeElements.append('path')
          .attr('id', d => `arc-top-${d.id}`)
          .attr('d', this.makeArcPath(true))
          .attr('fill', 'none');

        this.nodeElements.append('path')
          .attr('id', d => `arc-bottom-${d.id}`)
          .attr('d', this.makeArcPath(false))
          .attr('fill', 'none');

        const topText = this.nodeElements.append('text')
          .attr('class', 'name-top')
          // pull text slightly upward for visual balance
          .attr('dy', '-0.3em');

        topText.append('textPath')
          .attr('xlink:href', d => `#arc-top-${d.id}`)
          .attr('startOffset', '50%')
          .style('text-anchor', 'middle')
          .text(d => this.splitName(d.mbti_profile || "")[0])
          .attr('fill', d => this.getColorForCategory(d.category));

        const bottomText = this.nodeElements.append('text')
          .attr('class', 'name-bottom')
          // push text slightly downward so it clears the bubble
          .attr('dy', '0.8em');

        bottomText.append('textPath')
          .attr('xlink:href', d => `#arc-bottom-${d.id}`)
          .attr('startOffset', '50%')
          .style('text-anchor', 'middle')
          .text(d => this.splitName(d.mbti_profile || "")[1])
          .attr('fill', d => this.getColorForCategory(d.category));

        this.npcService.simulation.on('tick', () => {
          this.nodeElements.attr('transform', (d: any) =>
            `translate(${d.x}, ${d.y})`
          );
          this.adjustFontSize();
        });
      });

      this.npcService.initSimulation(this.width, this.height);
      window.addEventListener('resize', this.resizeListener);
    });
  }

  private onResize(): void {
    const newWidth = this.svgContainer.nativeElement.clientWidth;
    const newHeight = this.svgContainer.nativeElement.clientHeight;
    this.width = newWidth;
    this.height = newHeight;
    this.svg.attr('width', newWidth).attr('height', newHeight);

    if (this.npcService.simulation) {
      const centerForce = this.npcService.simulation.force<d3.ForceCenter<NpcNode>>('center');
      if (centerForce) {
        centerForce.x(newWidth / 2);
        centerForce.y(newHeight / 2);
      }
      this.npcService.simulation.alpha(1).restart();
    }
  }

  zoomIn(): void {
    if (this.zoomBehavior) {
      this.svg.transition().call(this.zoomBehavior.scaleBy as any, 1.2);
    }
  }

  zoomOut(): void {
    if (this.zoomBehavior) {
      this.svg.transition().call(this.zoomBehavior.scaleBy as any, 0.8);
    }
  }

  addNpc(event: MouseEvent): void {
    this.router.navigate(['/profile-selector']).then(() => {
      console.log('Navigated to profile-selector for adding NPC.');
    });
  }

  onSearchTermChange(): void {
    this.filterNodes();
    this.search();
  }

  filterNodes(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!this.nodeElements) {
      return;
    }
    this.nodeElements.style('display', d => {
      const mbti = d.mbti_profile?.toLowerCase() || '';
      const name = d.profile_name_searchable?.toLowerCase() || '';
      return mbti.includes(term) || name.includes(term) ? null : 'none';
    });
  }

  search(): void {
    const term = this.searchTerm.trim();
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (!term) {
      this.searchResults = [];
      return;
    }
    this.searchSub = this.profileService.searchCharacters(term).subscribe(res => {
      this.searchResults = res.data.results;
    });
  }

  addSearchedProfile(profile: SearchResponseProfile): void {
    // Map minimal fields into the ProfileResponse format expected by the simulation service
    const mapped: ProfileResponse = {
      id: +profile.id,
      property_id: 0,
      mbti_profile: profile.personalities.find(p => p.system === 'Four Letter')?.personality || '',
      profile_name: profile.name,
      profile_name_searchable: profile.name.toLowerCase(),
      allow_commenting: true,
      allow_voting: profile.allowVoting,
      user_id: 0,
      contributor: '',
      contributor_create_date: '',
      contributor_pic_path: '',
      display_order: 0,
      edit_lock: 0,
      edit_lock_picture: 0,
      is_active: true,
      is_approved: true,
      mbti_enneagram_type: '',
      mbti_type: profile.personalities.find(p => p.system === 'Four Letter')?.personality || '',
      pdb_comment_access: false,
      pdb_page_owner: 0,
      pdb_public_access: true,
      wiki_description: '',
      wiki_description_html: '',
      watch_count: 0,
      comment_count: profile.commentCount,
      vote_count: profile.voteCount,
      vote_count_enneagram: 0,
      vote_count_mbti: 0,
      total_vote_counts: 0,
      personality_type: '',
      type_updated_date: '',
      enneagram_vote: '',
      enneagram_vote_id: 0,
      mbti_vote: '',
      mbti_vote_id: 0,
      is_watching: false,
      image_exists: true,
      profile_image_url: profile.image?.picURL,
      profile_image_credit: '',
      profile_image_credit_id: 0,
      profile_image_credit_type: '',
      profile_image_credit_url: '',
      alt_subcategory: '',
      related_subcategories: '',
      cat_id: +profile.categoryID,
      category: '',
      category_is_fictional: false,
      sub_cat_id: +profile.subcatID,
      subcategory: profile.subcategory,
      subcat_link_info: { sub_cat_id: 0, cat_id: 0, property_id: 0, subcategory: '' },
      related_subcat_link_info: [],
      related_profiles: [],
      functions: [],
      systems: [],
      breakdown_systems: {},
      breakdown_config: { expand: {}, fire: {} },
      mbti_letter_stats: [],
      topic_info: { can_generate: false, topic: { description: '', follow_count: 0, post_count: 0, topic_id: 0, topic_name: '', id: 0, is_following: false, is_join_pending: false, is_banned: false, is_moderated: false, name_readable: '', source_profile_id: 0, source_type: '', join_to_post: false, can_pin: false, related_topics: [] }, topic_image_url: '', source_location: { cid: 0, pid: 0, sub_cat_id: 0 }, can_post_image: false, can_post_audio: false, posts: { posts: [] } },
      self_reported_mbti: null,
    } as ProfileResponse;

    this.npcService.addNpc(mapped);
    this.searchResults = [];
    this.searchTerm = '';
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.npcService.simulation) {
      this.npcService.stopSimulation();
    }
  }

  getMbti(profile: SearchResponseProfile): string {
    return (
      profile.personalities.find(p => p.system === 'Four Letter')?.personality ||
      ''
    );
  }

  private getColorForCategory(category: string): string {
    switch (category) {
      case 'Pop Culture': return '#a6cee3';
      case 'Television': return '#1f78b4';
      case 'Movies': return '#b2df8a';
      case 'Sports': return '#33a02c';
      case 'Cartoons': return '#fb9a99';
      case 'Anime & Manga': return '#e31a1c';
      case 'Comics': return '#fdbf6f';
      case 'Noteworthy': return '#ff7f00';
      case 'Gaming': return '#cab2d6';
      case 'Literature': return '#6a3d9a';
      case 'Theatre': return '#ffff99';
      case 'Musician': return '#b15928';
      case 'Internet': return '#8dd3c7';
      case 'The Arts': return '#ffffb3';
      case 'Business': return '#bebada';
      case 'Religion': return '#fb8072';
      case 'Science': return '#80b1d3';
      case 'Historical': return '#fdb462';
      case 'Web Comics': return '#b3de69';
      case 'Superheroes': return '#fccde5';
      case 'Philosophy': return '#d9d9d9';
      case 'Kpop': return '#bc80bd';
      case 'Traits': return '#ccebc5';
      case 'Plots & Archetypes': return '#ffed6f';
      case 'Concepts': return '#d8b365';
      case 'Music': return '#5ab4ac';
      case 'Franchises': return '#66c2a5';
      case 'Culture': return '#fc8d62';
      case 'Theories': return '#8da0cb';
      case 'Polls (If you...)': return '#e78ac3';
      case 'Your Experience': return '#a6d854';
      case 'Type Combo (Your Type)': return '#ffd92f';
      case 'Ask Pdb': return '#e5c494';
      case 'PDB Community': return '#b3b3b3';
      case 'Nature': return '#a1d99b';
      case 'Technology': return '#9ecae1';
      default: return '#888888';
    }
  }

  private splitName(name: string = ''): [string, string] {
    if (!name) {
      return ['', ''];
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      const mid = Math.ceil(parts.length / 2);
      const top = parts.slice(0, mid).join(' ');
      const bottom = parts.slice(mid).join(' ');
      return [top, bottom];
    }
    if (name.length <= 12) {
      return [name, ''];
    }
    const half = Math.ceil(name.length / 2);
    const first = name.slice(0, half).trim();
    const second = name.slice(half).trim();
    return [first, second];
  }

  private adjustFontSize(): void {
    const min = 8;
    const max = 12;
    this.nodeElements.each((d, i, nodes) => {
      const dist = Math.min(d.x ?? 0, this.width - (d.x ?? 0));
      const size = dist < 50 ? min + ((max - min) * dist) / 50 : max;
      d3.select(nodes[i]).selectAll('text').style('font-size', `${size}px`);
    });
  }

  private makeArcPath(isTop: boolean): string {
    const r = this.bubbleRadius + this.nameMargin;
    const sweep = isTop ? 1 : 0;
    return `M -${r},0 A ${r} ${r} 0 0 ${sweep} ${r},0`;
  }
}
