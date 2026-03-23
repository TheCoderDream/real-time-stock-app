import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockToggle } from './stock-toggle';

@Component({
  standalone: true,
  imports: [StockToggle],
  template: `<app-stock-toggle [(active)]="active" (activeChange)="onChange($event)" />`,
})
class TestHostComponent {
  active = signal(false);
  lastEmitted: boolean | undefined;
  onChange(value: boolean): void {
    this.lastEmitted = value;
  }
}

describe('StockToggle', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }

  function getLabelText(): string {
    return (fixture.nativeElement.querySelector('.toggle__label') as HTMLElement).textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows OFF label when inactive', () => {
    expect(getLabelText()).toBe('OFF');
  });

  it('shows ON label when active', () => {
    host.active.set(true);
    fixture.detectChanges();
    expect(getLabelText()).toBe('ON');
  });

  it('sets aria-checked to false when inactive', () => {
    expect(getButton().getAttribute('aria-checked')).toBe('false');
  });

  it('sets aria-checked to true when active', () => {
    host.active.set(true);
    fixture.detectChanges();
    expect(getButton().getAttribute('aria-checked')).toBe('true');
  });

  it('has role=switch on the button', () => {
    expect(getButton().getAttribute('role')).toBe('switch');
  });

  it('toggles from OFF to ON on click', () => {
    getButton().click();
    fixture.detectChanges();
    expect(getLabelText()).toBe('ON');
  });

  it('toggles from ON to OFF on second click', () => {
    host.active.set(true);
    fixture.detectChanges();
    getButton().click();
    fixture.detectChanges();
    expect(getLabelText()).toBe('OFF');
  });

  it('emits the new value via activeChange output when clicked', () => {
    getButton().click();
    fixture.detectChanges();
    expect(host.lastEmitted).toBe(true);
  });
});
