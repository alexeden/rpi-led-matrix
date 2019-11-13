import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface MatrixConfig {
  cols: number;
  rows: number;
}

@Injectable({
  providedIn: 'root',
})
export class BufferService {
  private readonly config$ = new ReplaySubject<MatrixConfig>(1);

  readonly buffer: Observable<ArrayBuffer>;

  constructor() {
    this.buffer = this.config$.pipe(
      map(({ cols, rows }) => new ArrayBuffer(3 * rows * (cols + 2))),
      shareReplay(1)
    );
  }

  async init() {
    const response = await fetch('/api/config');
    const config = await response.json();
    console.log(config);

    this.config$.next(config);
  }
}
