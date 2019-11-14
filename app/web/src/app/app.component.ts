import { Component, OnInit } from '@angular/core';
import { SocketService } from './socket.service';
import { BufferService } from './buffer.service';

@Component({
  selector: 'matrix-root',
  template: `
    <div>
      <button *ngIf="!(socketService.connected | async)" (click)="socketService.connect()">Connect</button>
      <button *ngIf="socketService.connected | async" (click)="socketService.disconnect()">Disconnect</button>
      <h1>{{ (socketService.connected | async) ? "Connected" : "Not Connected" }}</h1>
      <matrix-canvas></matrix-canvas>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  constructor(
    readonly bufferService: BufferService,
    readonly socketService: SocketService
  ) { }

  ngOnInit() {
    this.bufferService.init();
  }
}
