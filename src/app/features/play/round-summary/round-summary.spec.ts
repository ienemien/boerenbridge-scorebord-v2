import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundSummary } from './round-summary';

describe('RoundSummary', () => {
  let component: RoundSummary;
  let fixture: ComponentFixture<RoundSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isLastStep', false);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
