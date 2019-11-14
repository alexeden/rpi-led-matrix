import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SocketService } from './socket.service';
import { BufferService } from './buffer.service';
import { CanvasComponent } from './canvas/canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    BufferService,
    SocketService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
