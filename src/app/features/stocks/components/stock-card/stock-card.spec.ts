import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockCard } from './stock-card';
import { StockData } from '../../models/stock.model';
import { createStockData } from '../../testing/stock-data.factory';

@Component({
  standalone: true,
  imports: [StockCard],
  template: `
    <app-stock-card
      [stock]="stock()"
      (toggleChanged)="onToggle($event)"
    />
  `,
})
class TestHostComponent {
  stock = signal<StockData>(createStockData({ change: 2.3 }));
  lastToggled: string | undefined;

  onToggle(symbol: string): void {
    this.lastToggled = symbol;
  }
}

describe('StockCard', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the stock-card-header sub-component', () => {
    expect(fixture.nativeElement.querySelector('app-stock-card-header')).toBeTruthy();
  });

  it('renders the stock-price-change sub-component', () => {
    expect(fixture.nativeElement.querySelector('app-stock-price-change')).toBeTruthy();
  });

  it('renders at least two stock-details-row sub-components', () => {
    const rows = fixture.nativeElement.querySelectorAll('app-stock-details-row');
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the stock-toggle sub-component', () => {
    expect(fixture.nativeElement.querySelector('app-stock-toggle')).toBeTruthy();
  });

  it('applies price-direction--up class to the card when change is positive', () => {
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    expect(card.classList).toContain('price-direction--up');
  });

  it('applies price-direction--down class when change is negative', () => {
    host.stock.set(createStockData({ change: -1.5, isActive: true }));
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    expect(card.classList).toContain('price-direction--down');
  });

  it('applies price-direction--neutral class when stock is inactive', () => {
    host.stock.set(createStockData({ isActive: false }));
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    expect(card.classList).toContain('price-direction--neutral');
  });

  it('emits toggleChanged with the stock symbol when the toggle is clicked', () => {
    const toggleButton = fixture.nativeElement.querySelector('app-stock-toggle button') as HTMLButtonElement;
    toggleButton.click();
    fixture.detectChanges();
    expect(host.lastToggled).toBe('AAPL');
  });
});
