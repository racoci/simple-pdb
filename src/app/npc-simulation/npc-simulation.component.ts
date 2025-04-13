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

      this.npcService.initSimulation(this.width, this.height);

      this.nodeElements = this.svg.selectAll<SVGGElement, NpcNode>('g')
        .data(this.npcService.getNodes(), (d: NpcNode) => String(d.id)) // Ensure `d` is typed as `NpcNode`
        .enter()
        .append('g')
        .attr('class', 'npc-node');

      this.nodeElements.append('circle')
        .attr('r', 15)
        .attr('fill', d => this.getColorForCategory(d.category));

      this.nodeElements.append('text')
        .text(d => d.mbti)
        .attr('dy', -20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .style('font-size', '12px');

      this.npcService.simulation.on('tick', () => {
        this.nodeElements.attr('transform', (d: any) =>
          `translate(${d.x}, ${d.y})`
        );
      });

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
      case 'Analyst':  return '#1f77b4'; // blue
      case 'Diplomat': return '#2ca02c'; // green
      case 'Sentinel': return '#ff7f0e'; // orange
      case 'Explorer': return '#d62728'; // red
      default:         return '#888888'; // gray (unknown/other)
    }
  }
}
