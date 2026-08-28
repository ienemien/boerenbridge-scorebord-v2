import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { FarmThemeService } from './core/services/farm-theme';

describe('App', () => {
  let farmTheme: FarmThemeService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    farmTheme = TestBed.inject(FarmThemeService);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders the toolbar title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('Boerenbridge Scorebord');
  });

  it('activates the farm theme after 7 rapid taps on the title', () => {
    jest.useFakeTimers().setSystemTime(0);
    const app = TestBed.createComponent(App).componentInstance;

    for (let i = 0; i < 7; i++) {
      jest.advanceTimersByTime(100);
      app.registerTitleTap();
    }

    expect(farmTheme.isActive()).toBe(true);
    jest.useRealTimers();
  });

  it('does not activate the farm theme when taps are spread out', () => {
    jest.useFakeTimers().setSystemTime(0);
    const app = TestBed.createComponent(App).componentInstance;

    for (let i = 0; i < 7; i++) {
      jest.advanceTimersByTime(2000);
      app.registerTitleTap();
    }

    expect(farmTheme.isActive()).toBe(false);
    jest.useRealTimers();
  });
});
