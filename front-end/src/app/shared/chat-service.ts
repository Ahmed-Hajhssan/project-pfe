import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';


@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); 
  }

  public sendMessage(message: string): void {
    this.socket.emit('message', message);
  }

  public getMessages(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('message', (message: string) => {
        observer.next(message);
      });
    });
  }
}