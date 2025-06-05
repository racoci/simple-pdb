import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
// Removed Router import as it's no longer used for profile navigation
import * as d3 from 'd3';
import { NpcNode, NpcSimulationService } from './services/npc-simulation.service';
import { UiStateService } from '../shared/ui-state.service'; // Corrected import path

@Component({
  selector: 'app-npc-simulation',
  templateUrl: './npc-simulation.component.html',
  styleUrls: ['./npc-simulation.component.css']
})
export class NpcSimulationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltip', { static: true }) tooltipElement!: ElementRef<HTMLDivElement>;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private nodeElements!: d3.Selection<SVGGElement, NpcNode, SVGSVGElement, unknown>;
  private tooltip!: d3.Selection<HTMLDivElement, unknown, null, undefined>;

  private width: number = 0;
  private height: number = 0;
  private resizeListener = this.onResize.bind(this);

  constructor(
    private npcService: NpcSimulationService,
    private ngZone: NgZone,
    private uiStateService: UiStateService // Inject UiStateService
    // Removed Router from constructor
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.svg = d3.select(this.svgContainer.nativeElement);
      this.tooltip = d3.select(this.tooltipElement.nativeElement);
      this.width = this.svgContainer.nativeElement.clientWidth;
      this.height = this.svgContainer.nativeElement.clientHeight;
      this.svg.attr('width', this.width).attr('height', this.height);

      this.npcService.simulationReady$.subscribe(() => {
        const nodes = this.npcService.getNodes();

        this.nodeElements = this.svg.selectAll<SVGGElement, NpcNode>('g.npc-node')
          .data(nodes, (d: NpcNode) => String(d.id))
          .join(
            enter => {
              const g = enter.append('g')
                .attr('class', 'npc-node')
                .attr('transform', d => `translate(${d.x ?? this.width / 2}, ${d.y ?? this.height / 2})`)
                .on('click', (event, node) => {
                  const profile = node;
                  if (profile) {
                    this.ngZone.run(() => {
                      // Use UiStateService to select the profile, triggering the sidebar
                      this.uiStateService.selectProfile(String(profile.id));
                      console.log('Profile selected for sidebar:', profile.profile_name_searchable);
                    });
                  }
                })
                .on('mouseover', (event, d) => {
                  this.tooltip.transition().duration(200).style('opacity', .9);
                  this.tooltip.html(
                    `<strong>${d.profile_name_searchable}</strong><br/>` +
                    `MBTI: ${d.mbti_profile}<br/>` +
                    `Signal: ${d.signal ?? 'N/A'}<br/>` +
                    `Influence: ${d.influence ?? 'N/A'}`
                  )
                  .style('left', (event.pageX + 15) + 'px')
                  .style('top', (event.pageY - 28) + 'px');
                })
                .on('mousemove', (event) => {
                   this.tooltip.style('left', (event.pageX + 15) + 'px')
                              .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', () => {
                  this.tooltip.transition().duration(500).style('opacity', 0);
                });

              const nodeRadius = 15; // Define radius for consistency

              g.append('defs')
                .append('clipPath')
                .attr('id', d => `clip-${d.id}`)
                .append('circle')
                .attr('r', nodeRadius)
                .attr('cx', 0)
                .attr('cy', 0);

              g.append('image')
                .attr('xlink:href', d => d.profile_image_url ?? '')
                .attr('x', -nodeRadius)
                .attr('y', -nodeRadius)
                .attr('width', nodeRadius * 2)
                .attr('height', nodeRadius * 2)
                .attr('clip-path', d => `url(#clip-${d.id})`)
                // Add preserveAspectRatio for pixel-perfect cropping
                .attr('preserveAspectRatio', 'xMidYMid slice');

              g.append('circle') // Border circle
                .attr('r', nodeRadius)
                .attr('fill', 'none')
                .attr('stroke-width', 2)
                .attr('stroke', d => this.getColorForCategory(d.category));

              g.append('text') // Label text
                .text(d => d.mbti_profile)
                .attr('dy', -(nodeRadius + 7)) // Position above the circle border
                .attr('text-anchor', 'middle')
                .attr('fill', d => this.getColorForCategory(d.category))
                .style('font-size', '12px')
                .style('paint-order', 'stroke') // Ensure text is readable over lines
                .style('stroke', '#1a1a1a') // Dark background color for halo
                .style('stroke-width', '3px')
                .style('stroke-linecap', 'round')
                .style('stroke-linejoin', 'round');

              return g;
            },
            update => {
              // Potentially update existing elements if needed, e.g., image URL
              update.select('image')
                    .attr('xlink:href', d => d.profile_image_url ?? '');
              update.select('circle.border') // Assuming border circle has class 'border'
                    .attr('stroke', d => this.getColorForCategory(d.category));
              update.select('text')
                    .text(d => d.mbti_profile)
                    .attr('fill', d => this.getColorForCategory(d.category));
              return update;
            },
            exit => exit.remove()
          );

        this.npcService.simulation.on('tick', () => {
          this.nodeElements.attr('transform', (d: any) =>
            `translate(${d.x}, ${d.y})`
          );
          // Need to add link updates here as well if links are drawn
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
    // This button's functionality needs to be defined as part of Feature 4: Graph Controls
    console.log('Add NPC button clicked - functionality pending.');
    // Example: Trigger a modal or navigate to a selection component
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    if (this.npcService.simulation) {
      this.npcService.stopSimulation();
    }
  }

  private getColorForCategory(category: string): string {
    const colorMap: { [key: string]: string } = {
      'Pop Culture': '#a6cee3', 'Television': '#1f78b4', 'Movies': '#b2df8a',
      'Sports': '#33a02c', 'Cartoons': '#fb9a99', 'Anime & Manga': '#e31a1c',
      'Comics': '#fdbf6f', 'Noteworthy': '#ff7f00', 'Gaming': '#cab2d6',
      'Literature': '#6a3d9a', 'Theatre': '#ffff99', 'Musician': '#b15928',
      'Internet': '#8dd3c7', 'The Arts': '#ffffb3', 'Business': '#bebada',
      'Religion': '#fb8072', 'Science': '#80b1d3', 'Historical': '#fdb462',
      'Web Comics': '#b3de69', 'Superheroes': '#fccde5', 'Philosophy': '#d9d9d9',
      'Kpop': '#bc80bd', 'Traits': '#ccebc5', 'Plots & Archetypes': '#ffed6f',
      'Concepts': '#d8b365', 'Music': '#5ab4ac', 'Franchises': '#66c2a5',
      'Culture': '#fc8d62', 'Theories': '#8da0cb', 'Polls (If you...)': '#e78ac3',
      'Your Experience': '#a6d854', 'Type Combo (Your Type)': '#ffd92f',
      'Ask Pdb': '#e5c494', 'PDB Community': '#b3b3b3', 'Nature': '#a1d99b',
      'Technology': '#9ecae1'
    };
    return colorMap[category] || '#888888';
  }
}

