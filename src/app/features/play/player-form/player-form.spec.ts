import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { PlayerForm } from './player-form';
import { GameStateService } from '../../../core/services/game-state';
import { Player } from '../../../core/models/game.models';

function dragDropEvent(previousIndex: number, currentIndex: number): CdkDragDrop<Player[]> {
  return { previousIndex, currentIndex } as CdkDragDrop<Player[]>;
}

function addPlayers(component: PlayerForm, names: string[]): void {
  for (const name of names) {
    component.newPlayerName.set(name);
    component.addPlayer();
  }
}

describe('PlayerForm', () => {
  let component: PlayerForm;
  let fixture: ComponentFixture<PlayerForm>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [PlayerForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reorders players when a row is dragged and dropped', () => {
    addPlayers(component, ['Anna', 'Bram', 'Cas']);

    component.reorder(dragDropEvent(0, 2));

    expect(component.players().map((p) => p.name)).toEqual(['Bram', 'Cas', 'Anna']);
  });

  it('sets the starting dealer via setDealer', () => {
    addPlayers(component, ['Anna', 'Bram']);
    const bramId = component.players()[1].id;

    component.setDealer(bramId);

    expect(component.startingDealerId()).toBe(bramId);
  });

  it('clears the chosen starting dealer once that player is removed', () => {
    addPlayers(component, ['Anna', 'Bram']);
    const bramId = component.players()[1].id;

    component.startingDealerId.set(bramId);
    component.removePlayer(bramId);

    expect(component.startingDealerId()).toBeNull();
  });

  it('passes the chosen starting dealer through when starting the game', () => {
    addPlayers(component, ['Anna', 'Bram']);
    const bramId = component.players()[1].id;
    component.startingDealerId.set(bramId);

    const gameState = TestBed.inject(GameStateService);
    const savePlayersSpy = jest.spyOn(gameState, 'savePlayers');

    component.startGame();

    expect(savePlayersSpy).toHaveBeenCalledWith(component.players(), bramId);
  });

  it('defaults to the first player as dealer when none was chosen', () => {
    addPlayers(component, ['Anna', 'Bram']);

    const gameState = TestBed.inject(GameStateService);
    const savePlayersSpy = jest.spyOn(gameState, 'savePlayers');

    component.startGame();

    expect(savePlayersSpy).toHaveBeenCalledWith(component.players(), undefined);
  });
});
