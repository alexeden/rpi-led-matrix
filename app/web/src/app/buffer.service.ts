import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

interface MatrixConfig {
  cols: number;
  rows: number;
}

@Injectable({
  providedIn: 'root',
})
export class BufferService {
  private readonly config$ = new ReplaySubject<MatrixConfig>(1);

  constructor() { }

  async init() {
    const response = await fetch('/api/config');
    console.log(response);

  }
}
