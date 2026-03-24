import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { StockDashboard } from './stock-dashboard';
import { StockStateService } from '../../services/stock-state.service';
import { StockApiService } from '../../services/stock-api.service';
import { STOCK_PRICE_STREAM } from '../../stocks.config';
import { StockPriceUpdate } from '../../models/stock.model';

describe('StockDashboard', () => {
  let fixture: ComponentFixture<StockDashboard>;
  let stateService: StockStateService;
  let priceSubject: Subject<StockPriceUpdate>;

  beforeEach(async () => {
    localStorage.clear();
    priceSubject = new Subject<StockPriceUpdate>();

    await TestBed.configureTestingModule({
      imports: [StockDashboard],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: STOCK_PRICE_STREAM,
          useValue: { prices$: priceSubject.asObservable(), notifyToggle: vi.fn() },
        },
        {
          provide: StockApiService,
          useValue: { fetchAllStocks: () => throwError(() => new Error('mock error')) },
        },
      ],
    }).compileComponents();

    stateService = TestBed.inject(StockStateService);
    fixture = TestBed.createComponent(StockDashboard);
    fixture.detectChanges();
  });

  it('shows 12 skeleton cards when isLoading is true', () => {
    stateService.isLoading.set(true);
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('app-stock-card-skeleton');
    expect(skeletons.length).toBe(12);
  });

  it('hides skeleton cards when isLoading is false', () => {
    stateService.isLoading.set(false);
    fixture.detectChanges();
    const skeletons = fixture.nativeElement.querySelectorAll('app-stock-card-skeleton');
    expect(skeletons.length).toBe(0);
  });

  it('renders one stock-card per stock in the stocks signal', () => {
    stateService.isLoading.set(false);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-stock-card');
    expect(cards.length).toBe(stateService.stocks().length);
  });

  it('renders no stock-cards while loading', () => {
    stateService.isLoading.set(true);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-stock-card');
    expect(cards.length).toBe(0);
  });

  it('calls state.toggleStock with the stock symbol on toggleChanged event', () => {
    stateService.isLoading.set(false);
    fixture.detectChanges();

    const toggleSpy = vi.spyOn(stateService, 'toggleStock');
    const firstCard = fixture.nativeElement.querySelector('app-stock-card');
    const toggleButton = firstCard?.querySelector('button') as HTMLButtonElement;
    toggleButton?.click();
    fixture.detectChanges();

    expect(toggleSpy).toHaveBeenCalledWith(stateService.stocks()[0].symbol);
  });
});
