import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTricksForm } from './choose-tricks-form';
import { GameStateService } from '../../../core/services/game-state';

describe('ChooseTricksForm', () => {
  let component: ChooseTricksForm;
  let fixture: ComponentFixture<ChooseTricksForm>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChooseTricksForm],
    }).compileComponents();

    TestBed.inject(GameStateService).savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);

    fixture = TestBed.createComponent(ChooseTricksForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
