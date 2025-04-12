import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NpcSimulationService, NpcNode } from './npc-simulation.service';
import { Application, Graphics, Text } from 'pixi.js';
import * as d3 from 'd3';

@Component({
  selector: 'app-npc-simulation',
  templateUrl: './npc-simulation.component.html',
  styleUrls: ['./npc-simulation.component.css']
})
export class NpcSimulationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pixiContainer', { static: true }) pixiContainer!: ElementRef<HTMLDivElement>;
  private pixiApp!: Application;
  // Map of node IDs to Pixi Graphics objects (for updating positions)
  private nodeSprites: Map<number, Graphics> = new Map();
  // Store the resize listener reference so we can remove it later
  private resizeListener = this.onResize.bind(this);

  constructor(
    private npcService: NpcSimulationService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      // Dynamically determine the container's dimensions
      const container = this.pixiContainer.nativeElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Create a new PixiJS Application instance without constructor options
      this.pixiApp = new Application();
      // Initialize the PixiJS Application with dynamic dimensions
      this.pixiApp.init({
        width,
        height,
        backgroundColor: 0x222222
      });

      // Use canvas if available; fallback to view
      const canvasElement = this.pixiApp.canvas || this.pixiApp.view;
      if (canvasElement) {
        container.appendChild(canvasElement);
        console.log('Pixi canvas appended:', canvasElement);
      } else {
        console.error('Failed to retrieve Pixi canvas.');
      }

      // Add a listener for window resize events.
      window.addEventListener('resize', this.resizeListener);

      // Initialize the simulation (this creates initial nodes if none exist)
      this.npcService.initSimulation(width, height);

      // For each node, create a corresponding Pixi Graphics sprite.
      for (const node of this.npcService.getNodes()) {
        const circle = new Graphics();
        const color = this.getColorForCategory(node.category);
        circle.beginFill(color).drawCircle(0, 0, 15).endFill();
        
        // Add a text label for the MBTI code.
        const label = new Text(node.mbti, { fontSize: 12, fill: 0xffffff });
        label.anchor.set(0.5);
        label.y = -20;
        circle.addChild(label);
        
        // Set the initial position from node data.
        circle.x = node.x ?? 0;
        circle.y = node.y ?? 0;
        
        this.pixiApp.stage.addChild(circle);
        this.nodeSprites.set(node.id, circle);
      }

      // Listen for D3 simulation tick events to update sprite positions.
      this.npcService.simulation.on('tick', () => {
        for (const node of this.npcService.getNodes()) {
          const sprite = this.nodeSprites.get(node.id);
          if (sprite) {
            sprite.x = node.x!;
            sprite.y = node.y!;
          }
        }
      });
    });
  }

  private onResize(): void {
    // Recompute container dimensions on window resize.
    const container = this.pixiContainer.nativeElement;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    // Resize the PixiJS renderer.
    this.pixiApp.renderer.resize(newWidth, newHeight);
    
    // Update the D3 simulation center force.
    if (this.npcService.simulation) {
      const centerForce = this.npcService.simulation.force('center') as d3.ForceCenter<NpcNode>;
      if (centerForce) {
        centerForce.x(newWidth / 2);
        centerForce.y(newHeight / 2);
      }
      // Reheat the simulation to reflect new dimensions.
      this.npcService.simulation.alpha(1).restart();
    }
    
    console.log(`Resized to: ${newWidth}x${newHeight}`);
  }

  /** Handler for the "Add NPC" button */
  addNpc(event: MouseEvent): void {
    // Navigate to the personality selector route to add a new NPC.
    // (This route should handle NPC addition and then redirect back.)
    this.router.navigate(['/profile-selector']).then(() => {
      console.log('Navigated to profile-selector for adding NPC.');
    });
  }

  ngOnDestroy(): void {
    // Remove the resize listener.
    window.removeEventListener('resize', this.resizeListener);
    // Cleanup the simulation and destroy the PixiJS application.
    this.npcService.stopSimulation();
    if (this.pixiApp) {
      this.pixiApp.destroy();
    }
  }

  /** Helper: returns a color based on NPC category */
  private getColorForCategory(category: string): number {
    switch (category) {
      case 'Analyst':  return 0x1f77b4; // blue
      case 'Diplomat': return 0x2ca02c; // green
      case 'Sentinel': return 0xff7f0e; // orange
      case 'Explorer': return 0xd62728; // red
      default:         return 0x888888; // gray for unknown
    }
  }
}
