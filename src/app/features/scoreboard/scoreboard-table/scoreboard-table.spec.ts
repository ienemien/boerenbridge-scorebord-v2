import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardTable } from './scoreboard-table';

describe('ScoreboardTable', () => {
  let component: ScoreboardTable;
  let fixture: ComponentFixture<ScoreboardTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreboardTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
