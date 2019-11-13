import { Component } from '@angular/core';
import { SocketService } from './socket.service';

@Component({
  selector: 'matrix-root',
  template: `
    <div>
      <button (click)="socketService.connect()">Connect</button>
      <button (click)="socketService.disconnect()">Disconnect</button>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  constructor(
    readonly socketService: SocketService
  ) {}
}
