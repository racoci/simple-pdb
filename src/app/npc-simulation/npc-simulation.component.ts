import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import {NpcNode, NpcSimulationService} from './services/npc-simulation.service';
import {ProfileService} from '../personality/profile/services/profile.service';
import {ProfileResponse} from '../personality/profile/models/profile-response.model';
import {SearchResponseProfile} from '../personality/profile/models/search-response.model';
import { Subscription } from 'rxjs';
import { ProfileSidebarComponent } from './profile-sidebar.component';

@Component({
  selector: 'app-npc-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileSidebarComponent],
  templateUrl: './npc-simulation.component.html',
  styleUrls: ['./npc-simulation.component.css']
})
export class NpcSimulationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef<HTMLDivElement>;

  private graph: any;

  private readonly bubbleRadius = 25;
  private readonly nameMargin = 4;

  private width: number = 0;
  private height: number = 0;
  private resizeListener = this.onResize.bind(this);

  searchTerm = '';
  searchResults: SearchResponseProfile[] = [];
  private searchSub?: Subscription;

  hoveredProfile: ProfileResponse | null = null;
  @ViewChild('sidebar', { read: ElementRef }) sidebar?: ElementRef<HTMLElement>;
  sidebarWidth = 300;
  private isResizing = false;
  private resizeStart = 0;
  private sidebarStartWidth = 0;

  constructor(
    private npcService: NpcSimulationService,
    private profileService: ProfileService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.width = this.graphContainer.nativeElement.clientWidth;
      this.height = this.graphContainer.nativeElement.clientHeight;

      this.graph = new ForceGraph3D(this.graphContainer.nativeElement)
        .width(this.width)
        .height(this.height)
        .backgroundColor('#000')
        .nodeThreeObject((node: NpcNode) => this.createNodeObject(node))
        .enableNodeDrag(false)
        .onNodeClick((node: any) => {
          const profile = node as NpcNode;
          this.ngZone.run(() => {
            this.profileService
              .fetchProfile(String(profile.id))
              .subscribe(p => (this.hoveredProfile = p));
          });
        });

      this.graph.d3Force('link')?.distance((l: any) => l['distance']);

      this.npcService.simulationReady$.subscribe(() => {
        this.graph.graphData({
          nodes: this.npcService.getNodes(),
          links: this.npcService.getLinks()
        });
        this.filterNodes();
      });

      this.npcService.initSimulation(this.width, this.height);
      window.addEventListener('resize', this.resizeListener);
    });
  }

  private onResize(): void {
    const newWidth = this.graphContainer.nativeElement.clientWidth;
    const newHeight = this.graphContainer.nativeElement.clientHeight;
    this.width = newWidth;
    this.height = newHeight;
    if (this.graph) {
      this.graph.width(newWidth).height(newHeight);
    }
  }

  zoomIn(): void {
    if (this.graph) {
      const pos = this.graph.cameraPosition();
      this.graph.cameraPosition({ z: pos.z * 0.8 }, undefined, 300);
    }
  }

  zoomOut(): void {
    if (this.graph) {
      const pos = this.graph.cameraPosition();
      this.graph.cameraPosition({ z: pos.z * 1.2 }, undefined, 300);
    }
  }

  initResize(event: MouseEvent): void {
    if (!this.sidebar) {
      return;
    }
    this.isResizing = true;
    this.resizeStart = event.clientX;
    this.sidebarStartWidth = this.sidebarWidth;
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.stopResize);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isResizing || !this.sidebar) {
      return;
    }
    const dx = this.resizeStart - event.clientX;
    let newWidth = this.sidebarStartWidth + dx;
    newWidth = Math.min(Math.max(newWidth, 200), 500);
    this.sidebarWidth = newWidth;
  };

  private stopResize = (): void => {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.stopResize);
  };

  openProfilePage(id: number): void {
    this.router.navigate(['/profile', id]).then(() => {
      console.log('Profile button clicked');
    });
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
    if (this.graph) {
      this.graph.nodeVisibility((d: NpcNode) => {
        const mbti = d.mbti_profile?.toLowerCase() || '';
        const name = d.profile_name_searchable?.toLowerCase() || '';
        return !term || mbti.includes(term) || name.includes(term);
      });
    }
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

  private createNodeObject(node: NpcNode): THREE.Object3D {
    const group = new THREE.Group();

    const size = (this.bubbleRadius + this.nameMargin + 6) * 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;

    const finalize = () => {
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.getColorForCategory(node.category);
      ctx.beginPath();
      ctx.arc(center, center, this.bubbleRadius, 0, Math.PI * 2);
      ctx.stroke();

      const [top, bottom] = this.splitName(node.mbti_profile || '');
      ctx.fillStyle = this.getColorForCategory(node.category);
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      this.drawArcText(ctx, top, this.bubbleRadius + this.nameMargin, Math.PI, 0);
      if (bottom) {
        this.drawArcText(ctx, bottom, this.bubbleRadius + this.nameMargin, 0, Math.PI);
      }
      texture.needsUpdate = true;
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, this.bubbleRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        img,
        center - this.bubbleRadius,
        center - this.bubbleRadius,
        this.bubbleRadius * 2,
        this.bubbleRadius * 2
      );
      ctx.restore();
      finalize();
    };

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
    );
    sprite.scale.set(size, size, 1);
    group.add(sprite);

    if (node.profile_image_url) {
      img.src = node.profile_image_url;
    } else {
      finalize();
    }

    return group;
  }

  private drawArcText(
    ctx: CanvasRenderingContext2D,
    text: string,
    radius: number,
    startAngle: number,
    endAngle: number
  ): void {
    const chars = [...text];
    if (chars.length === 0) {
      return;
    }
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const angleRange = endAngle - startAngle;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle);
    const step = angleRange / chars.length;
    for (let i = 0; i < chars.length; i++) {
      ctx.rotate(step / 2);
      ctx.save();
      ctx.translate(0, -radius);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
      ctx.rotate(step / 2);
    }
    ctx.restore();
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

}
