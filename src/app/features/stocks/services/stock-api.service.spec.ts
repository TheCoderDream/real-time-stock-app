import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StockApiService } from './stock-api.service';
import { TRACKED_STOCKS } from '../stocks.config';
import { environment } from '@env';

const BASE_URL = environment.finnhub.restUrl;
const TOKEN = environment.finnhub.apiKey;

const mockQuote = { c: 230, d: 2.3, dp: 1.01, h: 232, l: 228, o: 229, pc: 227.7, t: 1711234567 };
const mockMetric = { metric: { '52WeekHigh': 299, '52WeekLow': 161 } };

describe('StockApiService', () => {
  let service: StockApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(StockApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('issues a quote and metric request for every tracked stock', () => {
    service.fetchAllStocks().subscribe();

    TRACKED_STOCKS.forEach((stock) => {
      httpTesting
        .expectOne(
          (req) =>
            req.url === `${BASE_URL}/quote` &&
            req.params.get('symbol') === stock.symbol &&
            req.params.get('token') === TOKEN
        )
        .flush(mockQuote);

      httpTesting
        .expectOne(
          (req) =>
            req.url === `${BASE_URL}/stock/metric` &&
            req.params.get('symbol') === stock.symbol &&
            req.params.get('metric') === 'all' &&
            req.params.get('token') === TOKEN
        )
        .flush(mockMetric);
    });
  });

  it('maps quote and metric responses to StockData correctly', () => {
    const firstStock = TRACKED_STOCKS[0];
    let result: import('../models/stock.model').StockData[] = [];

    service.fetchAllStocks().subscribe((stocks) => {
      result = stocks;
    });

    TRACKED_STOCKS.forEach((stock) => {
      httpTesting.expectOne((req) => req.url === `${BASE_URL}/quote` && req.params.get('symbol') === stock.symbol).flush(mockQuote);
      httpTesting.expectOne((req) => req.url === `${BASE_URL}/stock/metric` && req.params.get('symbol') === stock.symbol).flush(mockMetric);
    });

    const mapped = result[0];
    expect(mapped.symbol).toBe(firstStock.symbol);
    expect(mapped.currentPrice).toBe(mockQuote.c);
    expect(mapped.dailyHigh).toBe(mockQuote.h);
    expect(mapped.dailyLow).toBe(mockQuote.l);
    expect(mapped.change).toBe(mockQuote.d);
    expect(mapped.changePercent).toBe(mockQuote.dp);
    expect(mapped.week52High).toBe(mockMetric.metric['52WeekHigh']);
    expect(mapped.week52Low).toBe(mockMetric.metric['52WeekLow']);
    expect(mapped.lastTradeTime).toBe(mockQuote.t * 1000);
    expect(mapped.isActive).toBe(true);
  });

  it('falls back to 0 when 52-week fields are missing', () => {
    let result: import('../models/stock.model').StockData[] = [];

    service.fetchAllStocks().subscribe((stocks) => {
      result = stocks;
    });

    TRACKED_STOCKS.forEach((stock) => {
      httpTesting.expectOne((req) => req.url === `${BASE_URL}/quote` && req.params.get('symbol') === stock.symbol).flush(mockQuote);
      httpTesting
        .expectOne((req) => req.url === `${BASE_URL}/stock/metric` && req.params.get('symbol') === stock.symbol)
        .flush({ metric: {} });
    });

    expect(result[0].week52High).toBe(0);
    expect(result[0].week52Low).toBe(0);
  });
});
