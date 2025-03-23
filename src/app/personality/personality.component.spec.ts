import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalityComponent } from './personality.component';

describe('PersonalityComponent', () => {
  let component: PersonalityComponent;
  let fixture: ComponentFixture<PersonalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
