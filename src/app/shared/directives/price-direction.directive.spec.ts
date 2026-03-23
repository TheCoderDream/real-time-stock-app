import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceDirectionDirective } from './price-direction.directive';
import { PriceDirection } from '@features/stocks/models/stock.model';
import { provideZonelessChangeDetection } from '@angular/core';

@Component({
  standalone: true,
  imports: [PriceDirectionDirective],
  template: `<div [appPriceDirection]="direction()"></div>`,
})
class TestHostComponent {
  direction = signal<PriceDirection>('neutral');
}

describe('PriceDirectionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let div: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    div = fixture.nativeElement.querySelector('div') as HTMLElement;
  });

  it('applies price-direction--neutral class on initial neutral direction', () => {
    expect(div.classList).toContain('price-direction--neutral');
  });

  it('applies price-direction--up class for up direction', () => {
    host.direction.set('up');
    fixture.detectChanges();
    expect(div.classList).toContain('price-direction--up');
    expect(div.classList).not.toContain('price-direction--neutral');
  });

  it('applies price-direction--down class for down direction', () => {
    host.direction.set('down');
    fixture.detectChanges();
    expect(div.classList).toContain('price-direction--down');
    expect(div.classList).not.toContain('price-direction--neutral');
  });

  it('removes the previous class when direction changes', () => {
    host.direction.set('up');
    fixture.detectChanges();
    expect(div.classList).toContain('price-direction--up');

    host.direction.set('down');
    fixture.detectChanges();
    expect(div.classList).not.toContain('price-direction--up');
    expect(div.classList).toContain('price-direction--down');
  });

  it('only has one direction class at a time', () => {
    host.direction.set('up');
    fixture.detectChanges();
    const directionClasses = ['price-direction--up', 'price-direction--down', 'price-direction--neutral'];
    const activeClasses = directionClasses.filter((c) => div.classList.contains(c));
    expect(activeClasses.length).toBe(1);
  });
});
