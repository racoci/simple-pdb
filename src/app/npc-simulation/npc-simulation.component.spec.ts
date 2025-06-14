import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { NpcSimulationComponent } from './npc-simulation.component';
import { NpcSimulationService } from './services/npc-simulation.service';
import { ProfileService } from '../personality/profile/services/profile.service';
import { SearchResponseProfile } from '../personality/profile/models/search-response.model';
import { Subject } from 'rxjs';

describe('NpcSimulationComponent', () => {
  let component: NpcSimulationComponent;
  let fixture: ComponentFixture<NpcSimulationComponent>;
  let router: Router;

  beforeEach(async () => {
    const npcServiceStub = {
      simulationReady$: new Subject<void>(),
      initSimulation: () => {},
      getNodes: () => [],
      addNpc: () => {},
      stopSimulation: () => {}
    } as unknown as NpcSimulationService;

    await TestBed.configureTestingModule({
      imports: [NpcSimulationComponent, RouterTestingModule],
      providers: [
        { provide: NpcSimulationService, useValue: npcServiceStub },
        { provide: ProfileService, useValue: {} }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NpcSimulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return MBTI from search profile', () => {
    const profile: SearchResponseProfile = {
      id: '1',
      name: 'Test',
      catIcon: { picURL: '' },
      categoryID: '',
      subcategory: '',
      subcatID: '',
      subcategories: [],
      personalities: [{ system: 'Four Letter', personality: 'INTJ' }],
      allowVoting: false,
      voteCount: 0,
      savedCount: 0,
      commentCount: 0,
      isCharacter: true,
      isCelebrity: false,
      isMeme: false,
      chemistryLink: ''
    };

    expect(component.getMbti(profile)).toBe('INTJ');
  });
});
