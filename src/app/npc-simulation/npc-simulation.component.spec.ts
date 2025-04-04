import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NpcSimulationComponent } from './npc-simulation.component';

describe('NpcSimulationComponent', () => {
  let component: NpcSimulationComponent;
  let fixture: ComponentFixture<NpcSimulationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NpcSimulationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NpcSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
