import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAvatar } from './player-avatar';

describe('PlayerAvatar', () => {
  let component: PlayerAvatar;
  let fixture: ComponentFixture<PlayerAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerAvatar],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerAvatar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('player', { id: 1, name: 'Tom', avatarIcon: '🐱', avatarColor: '#7F77DD' });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses the player\'s own icon and color', () => {
    expect(component.icon()).toBe('🐱');
    expect(component.color()).toBe('#7F77DD');
  });

  it('falls back to a default when the player has no avatar (older saved games)', () => {
    fixture.componentRef.setInput('player', { id: 2, name: 'Michiel' });
    expect(component.icon()).not.toBe('');
    expect(component.color()).not.toBe('');
  });
});
