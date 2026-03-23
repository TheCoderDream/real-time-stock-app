import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import {
  StockData,
  FinnhubQuoteResponse,
  FinnhubMetricResponse,
} from '../models/stock.model';
import { TRACKED_STOCKS } from '../stocks.config';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class StockApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.finnhub.restUrl;
  private readonly token = environment.finnhub.apiKey;

  fetchAllStocks(): Observable<StockData[]> {
    const requests = TRACKED_STOCKS.map((stock) =>
      forkJoin({
        quote: this.fetchQuote(stock.symbol),
        metric: this.fetchMetric(stock.symbol),
      }).pipe(
        map(({ quote, metric }) => this.mapToStockData(stock.symbol, stock.name, quote, metric))
      )
    );

    return forkJoin(requests);
  }

  private fetchQuote(symbol: string): Observable<FinnhubQuoteResponse> {
    return this.http.get<FinnhubQuoteResponse>(
      `${this.baseUrl}/quote`,
      { params: { symbol, token: this.token } }
    );
  }

  private fetchMetric(symbol: string): Observable<FinnhubMetricResponse> {
    return this.http.get<FinnhubMetricResponse>(
      `${this.baseUrl}/stock/metric`,
      { params: { symbol, metric: 'all', token: this.token } }
    );
  }

  private mapToStockData(
    symbol: string,
    name: string,
    quote: FinnhubQuoteResponse,
    metric: FinnhubMetricResponse
  ): StockData {
    return {
      symbol,
      name,
      currentPrice: quote.c,
      previousClose: quote.pc,
      dailyHigh: quote.h,
      dailyLow: quote.l,
      week52High: metric.metric['52WeekHigh'] ?? 0,
      week52Low: metric.metric['52WeekLow'] ?? 0,
      change: quote.d,
      changePercent: quote.dp,
      lastTradeTime: quote.t * 1000,
      volume: 0,
      isActive: true,
    };
  }
}
