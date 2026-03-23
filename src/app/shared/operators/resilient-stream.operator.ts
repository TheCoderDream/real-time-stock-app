import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OperatorFunction, from, filter, mergeMap, retry, share, RetryConfig } from 'rxjs';

export interface ResilientStreamConfig<TIn, TFiltered extends TIn, TOut> {
  filter: (msg: TIn) => msg is TFiltered;
  project: (msg: TFiltered) => TOut[];
  retry?: RetryConfig;
  destroyRef: DestroyRef;
}

export function resilientStream<TIn, TFiltered extends TIn, TOut>(
  config: ResilientStreamConfig<TIn, TFiltered, TOut>
): OperatorFunction<TIn, TOut> {
  return (source$) =>
    source$.pipe(
      filter(config.filter),
      mergeMap((msg) => from(config.project(msg))),
      retry(config.retry ?? { count: 3, delay: 1000 }),
      takeUntilDestroyed(config.destroyRef),
      share(),
    );
}
