import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import {NpcNode, NpcSimulationService} from './services/npc-simulation.service';

@Component({
  selector: 'app-npc-simulation',
  templateUrl: './npc-simulation.component.html',
  styleUrls: ['./npc-simulation.component.css']
})
export class NpcSimulationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<SVGSVGElement>;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private nodeElements!: d3.Selection<SVGGElement, NpcNode, SVGSVGElement, unknown>;

  private width: number = 0;
  private height: number = 0;
  private resizeListener = this.onResize.bind(this);

  constructor(
    private npcService: NpcSimulationService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.svg = d3.select(this.svgContainer.nativeElement);
      this.width = this.svgContainer.nativeElement.clientWidth;
      this.height = this.svgContainer.nativeElement.clientHeight;
      this.svg.attr('width', this.width).attr('height', this.height);

      this.npcService.simulationReady$.subscribe(() => {
        const nodes = this.npcService.getNodes();

        this.nodeElements = this.svg.selectAll<SVGGElement, NpcNode>('g')
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
          });

        this.nodeElements.append('defs')
          .append('clipPath')
          .attr('id', d => `clip-${d.id}`)
          .append('circle')
          .attr('r', 15)
          .attr('cx', 0)
          .attr('cy', 0);

        this.nodeElements.append('image')
          .attr('xlink:href', d => d.profile_image_url ?? '')
          .attr('x', -15)
          .attr('y', -15)
          .attr('width', 30)
          .attr('height', 30)
          .attr('clip-path', d => `url(#clip-${d.id})`);

        this.nodeElements.append('circle')
          .attr('r', 15)
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke', d => this.getColorForCategory(d.category));

        this.nodeElements.append('text')
          .text(d => d.mbti_profile)
          .attr('dy', -22)
          .attr('text-anchor', 'middle')
          .attr('fill', d => this.getColorForCategory(d.category))
          .style('font-size', '12px');

        this.npcService.simulation.on('tick', () => {
          this.nodeElements.attr('transform', (d: any) =>
            `translate(${d.x}, ${d.y})`
          );
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

  addNpc(event: MouseEvent): void {
    this.router.navigate(['/profile-selector']).then(() => {
      console.log('Navigated to profile-selector for adding NPC.');
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    if (this.npcService.simulation) {
      this.npcService.stopSimulation();
    }
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
}
