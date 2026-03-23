import { Injectable, OnDestroy } from '@angular/core';
import {
  Observable,
  Subject,
  retry,
  share,
  filter,
  mergeMap,
  from,
  EMPTY,
  tap,
  finalize,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { StockPriceUpdate, FinnhubWsMessage } from '../models/stock.model';
import { TRACKED_STOCKS } from '../stocks.config';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class FinnhubWebSocketService implements OnDestroy {
  readonly prices$: Observable<StockPriceUpdate>;

  private socket$: WebSocketSubject<FinnhubWsMessage> | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.prices$ = this.createFinnhubStream();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket$?.complete();
  }

  private createFinnhubStream(): Observable<StockPriceUpdate> {
    const url = `${environment.finnhub.wsUrl}?token=${environment.finnhub.apiKey}`;

    this.socket$ = webSocket<FinnhubWsMessage>({
      url,
      openObserver: {
        next: () => {
          TRACKED_STOCKS.forEach((stock) => {
            this.socket$?.next({ type: 'subscribe', symbol: stock.symbol } as any);
          });
        },
      },
    });

    return this.socket$.pipe(
      filter((msg): msg is FinnhubWsMessage & { data: NonNullable<FinnhubWsMessage['data']> } =>
        msg.type === 'trade' && Array.isArray(msg.data) && msg.data.length > 0
      ),
      mergeMap((msg) =>
        from(
          msg.data.map(
            (trade): StockPriceUpdate => ({
              symbol: trade.s,
              price: trade.p,
              volume: trade.v,
              timestamp: trade.t,
            })
          )
        )
      ),
      retry({ count: 5, delay: 3000 }),
      share(),
      finalize(() => {
        TRACKED_STOCKS.forEach((stock) => {
          this.socket$?.next({ type: 'unsubscribe', symbol: stock.symbol } as any);
        });
      })
    );
  }
}
