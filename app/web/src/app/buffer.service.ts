import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatrixArrayBuffer } from './lib/matrix-array-buffer';

export interface MatrixConfig {
  cols: number;
  rows: number;
}

@Injectable({
  providedIn: 'root',
})
export class BufferService {
  private readonly config$ = new ReplaySubject<MatrixConfig>(1);

  readonly buffer: Observable<MatrixArrayBuffer>;
  readonly config: Observable<MatrixConfig>;

  constructor() {
    (window as any).bufferService = this;

    this.config = this.config$.pipe(shareReplay(1));

    this.buffer = this.config$.pipe(
      map(({ cols, rows }) => new MatrixArrayBuffer(rows, cols)),
      shareReplay(1)
    );
  }

  async init() {
    const response = await fetch('/api/config');
    const config = await response.json();

    this.config$.next(config);
  }
}
