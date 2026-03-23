import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockDetailsRow } from './stock-details-row';

@Component({
  standalone: true,
  imports: [StockDetailsRow],
  template: `<app-stock-details-row [label]="label()" [value]="value()" />`,
})
class TestHostComponent {
  label = signal('High');
  value = signal(232.0);
}

describe('StockDetailsRow', () => {
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

  it('renders the label text', () => {
    const labelEl = fixture.nativeElement.querySelector('.row__label') as HTMLElement;
    expect(labelEl.textContent?.trim()).toBe('High');
  });

  it('renders the price-formatted value', () => {
    const valueEl = fixture.nativeElement.querySelector('.row__value') as HTMLElement;
    expect(valueEl.textContent?.trim()).toBe('$232.00');
  });

  it('updates the label when input changes', () => {
    host.label.set('Low');
    fixture.detectChanges();
    const labelEl = fixture.nativeElement.querySelector('.row__label') as HTMLElement;
    expect(labelEl.textContent?.trim()).toBe('Low');
  });

  it('updates the formatted value when value input changes', () => {
    host.value.set(100.5);
    fixture.detectChanges();
    const valueEl = fixture.nativeElement.querySelector('.row__value') as HTMLElement;
    expect(valueEl.textContent?.trim()).toBe('$100.50');
  });
});
