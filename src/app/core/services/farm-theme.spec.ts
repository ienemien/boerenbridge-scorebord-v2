import { TestBed } from '@angular/core/testing';
import { FarmThemeService } from './farm-theme';

describe('FarmThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('farm-theme');
  });

  it('is off by default', () => {
    const service = TestBed.inject(FarmThemeService);
    expect(service.isActive()).toBe(false);
  });

  it('remembers an active state from a previous session', () => {
    localStorage.setItem('FARM_THEME', 'true');
    const service = TestBed.inject(FarmThemeService);
    expect(service.isActive()).toBe(true);
  });

  it('toggles and persists the choice', () => {
    const service = TestBed.inject(FarmThemeService);

    service.toggle();
    expect(service.isActive()).toBe(true);
    // The persisting effect doesn't run synchronously with the signal write.
    TestBed.tick();
    expect(localStorage.getItem('FARM_THEME')).toBe('true');
    expect(document.documentElement.classList.contains('farm-theme')).toBe(true);

    service.toggle();
    expect(service.isActive()).toBe(false);
    TestBed.tick();
    expect(localStorage.getItem('FARM_THEME')).toBe('false');
    expect(document.documentElement.classList.contains('farm-theme')).toBe(false);
  });
});
