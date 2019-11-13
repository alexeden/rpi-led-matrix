import { Component } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'matrix-root',
  template: `
    <div>
      <button *ngIf="!(socketService.connected | async)" (click)="socketService.connect()">Connect</button>
      <button *ngIf="socketService.connected | async" (click)="socketService.disconnect()">Disconnect</button>
      <h1>{{ (socketService.connected | async) ? "Connected" : "Not Connected" }}</h1>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  constructor(
    readonly socketService: SocketService

  ) {}
}
