import { Directive, effect, inject, input, Renderer2, ElementRef } from '@angular/core';
import { PriceDirection } from '@features/stocks/models/stock.model';

const CLASS_MAP: Record<PriceDirection, string> = {
  up: 'price-direction--up',
  down: 'price-direction--down',
  neutral: 'price-direction--neutral',
};

@Directive({
  selector: '[appPriceDirection]',
  standalone: true,
})
export class PriceDirectionDirective {
  appPriceDirection = input.required<PriceDirection>();

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private currentClass: string | null = null;

  constructor() {
    effect(() => {
      const direction = this.appPriceDirection();

      if (this.currentClass) {
        this.renderer.removeClass(this.el.nativeElement, this.currentClass);
      }

      const nextClass = CLASS_MAP[direction];
      this.renderer.addClass(this.el.nativeElement, nextClass);
      this.currentClass = nextClass;
    });
  }
}
