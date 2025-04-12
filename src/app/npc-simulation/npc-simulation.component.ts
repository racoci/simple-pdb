import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NpcSimulationService, NpcNode } from './npc-simulation.service';
import { Application, Graphics, Text } from 'pixi.js';

@Component({
  selector: 'app-npc-simulation',
  templateUrl: './npc-simulation.component.html',
  styleUrls: ['./npc-simulation.component.css']
})
export class NpcSimulationComponent implements OnInit, OnDestroy {
  @ViewChild('pixiContainer', { static: true }) pixiContainer!: ElementRef<HTMLDivElement>;
  private pixiApp!: Application;
  // Map of node IDs to Pixi Graphics objects (for updating positions)
  private nodeSprites: Map<number, Graphics> = new Map();

  constructor(
    private npcService: NpcSimulationService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Run the PixiJS and D3 simulation setup outside Angular's NgZone
    this.ngZone.runOutsideAngular(() => {
      // Create a PixiJS Application instance without options
      this.pixiApp = new Application();

      // Initialize the application using the new init() method
      this.pixiApp.init({
        width: 800,
        height: 600,
        backgroundColor: 0x222222
      });

      // Append the canvas (new property in v8) to the container
      this.pixiContainer.nativeElement.appendChild(this.pixiApp.canvas);
      console.log('Pixi canvas appended:', this.pixiApp.canvas);

      // Initialize the simulation (this will also create initial nodes if none)
      this.npcService.initSimulation(800, 600);

      // Create a Pixi circle (sprite) for each NPC node and add to stage
      for (const node of this.npcService.getNodes()) {
        // Create a circle graphic for the NPC
        const circle = new Graphics();
        const color = this.getColorForCategory(node.category);
        circle.beginFill(color).drawCircle(0, 0, 15).endFill();
        // Add a text label with the MBTI code
        const label = new Text(node.mbti, { fontSize: 12, fill: 0xffffff });
        label.anchor.set(0.5);
        label.y = -20;  // position label above the circle
        circle.addChild(label);
        // Set initial position (if node.x, node.y exist)
        circle.x = node.x ?? 0;
        circle.y = node.y ?? 0;
        // Add the circle to the Pixi stage (so it becomes visible)
        this.pixiApp.stage.addChild(circle);
        // Track this sprite by node id for later updates
        this.nodeSprites.set(node.id, circle);
      }

      // Listen for D3 simulation tick events and update sprite positions on each tick
      this.npcService.simulation.on('tick', () => {
        // On every tick, update each sprite's (x, y) from the node's updated position
        for (const node of this.npcService.getNodes()) {
          const sprite = this.nodeSprites.get(node.id);
          if (sprite) {
            sprite.x = node.x!;
            sprite.y = node.y!;
          }
        }
      });
      // PixiJS's internal ticker will redraw the stage at ~60fps.
    });
  }

  /** Handler for the "Add NPC" button */
  addNpc(): void {
    // Navigate to the personality selector route to choose a new NPC
    this.router.navigate(['/profile-selector']).then(() => {});
  }

  ngOnDestroy(): void {
    // Cleanup: stop the D3 simulation loop and destroy the Pixi application
    this.npcService.stopSimulation();
    if (this.pixiApp) {
      this.pixiApp.destroy();  // destroy the PixiJS application and its canvas
    }
  }

  /** Helper to pick a color for a given category (for visual distinction) */
  private getColorForCategory(category: string): number {
    switch (category) {
      case 'Analyst':  return 0x1f77b4; // blue
      case 'Diplomat': return 0x2ca02c; // green
      case 'Sentinel': return 0xff7f0e; // orange
      case 'Explorer': return 0xd62728; // red
      default:         return 0x888888; // gray for unknown/other
    }
  }
}
