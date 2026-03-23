import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat',
  standalone: true,
  pure: true,
})
export class PriceFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals = 2): string {
    if (value == null) return '--';
    return `$${value.toFixed(decimals)}`;
  }
}
