import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockPriceChange } from './stock-price-change';

@Component({
  standalone: true,
  imports: [StockPriceChange],
  template: `
    <app-stock-price-change
      [currentPrice]="currentPrice()"
      [change]="change()"
      [changePercent]="changePercent()"
    />
  `,
})
class TestHostComponent {
  currentPrice = signal(230.5);
  change = signal(2.3);
  changePercent = signal(1.01);
}

describe('StockPriceChange', () => {
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

  it('renders the current price formatted as currency', () => {
    const priceEl = fixture.nativeElement.querySelector('.price') as HTMLElement;
    expect(priceEl.textContent?.trim()).toBe('$230.50');
  });

  it('renders a positive change with a plus sign', () => {
    const changeEl = fixture.nativeElement.querySelector('.change') as HTMLElement;
    expect(changeEl.textContent?.trim()).toBe('+2.30');
  });

  it('renders a negative change without double minus', () => {
    host.change.set(-1.5);
    fixture.detectChanges();
    const changeEl = fixture.nativeElement.querySelector('.change') as HTMLElement;
    expect(changeEl.textContent?.trim()).toBe('-1.50');
  });

  it('renders the change percent wrapped in parentheses', () => {
    const pctEl = fixture.nativeElement.querySelector('.change-percent') as HTMLElement;
    expect(pctEl.textContent?.trim()).toBe('(1.01%)');
  });

  it('updates the displayed price when input changes', () => {
    host.currentPrice.set(999.99);
    fixture.detectChanges();
    const priceEl = fixture.nativeElement.querySelector('.price') as HTMLElement;
    expect(priceEl.textContent?.trim()).toBe('$999.99');
  });
});
