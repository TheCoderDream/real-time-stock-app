import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockCardHeader } from './stock-card-header';

@Component({
  standalone: true,
  imports: [StockCardHeader],
  template: `<app-stock-card-header [symbol]="symbol()" [name]="name()" />`,
})
class TestHostComponent {
  symbol = signal('AAPL');
  name = signal('Apple');
}

describe('StockCardHeader', () => {
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

  it('renders the symbol inside an h2 element', () => {
    const h2 = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(h2.textContent?.trim()).toBe('AAPL');
  });

  it('renders the name in a span element', () => {
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.textContent?.trim()).toBe('Apple');
  });

  it('updates the symbol when input changes', () => {
    host.symbol.set('MSFT');
    fixture.detectChanges();
    const h2 = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(h2.textContent?.trim()).toBe('MSFT');
  });

  it('updates the name when input changes', () => {
    host.name.set('Microsoft');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(span.textContent?.trim()).toBe('Microsoft');
  });
});
