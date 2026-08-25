import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { Home } from './home';
import { GameStateService } from '../../core/services/game-state';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let gameState: GameStateService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    gameState = TestBed.inject(GameStateService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates straight to "/" without a dialog when no game is in progress', () => {
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');
    const dialog = TestBed.inject(MatDialog);
    const openSpy = jest.spyOn(dialog, 'open');

    component.startNewGame();

    expect(openSpy).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('confirms before wiping an in-progress game', () => {
    gameState.savePlayers([
      { id: 1, name: 'Tom' },
      { id: 2, name: 'Michiel' },
    ]);
    const navigateSpy = jest.spyOn(router, 'navigateByUrl');
    const dialog = TestBed.inject(MatDialog);
    const openSpy = jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(true),
    } as ReturnType<MatDialog['open']>);

    component.startNewGame();

    expect(openSpy).toHaveBeenCalled();
    expect(gameState.currentStep()).toBe(0);
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });
});
