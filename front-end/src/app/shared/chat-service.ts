import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private baseUrl = environment.domain;
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  constructor() {}

  socket = io(this.baseUrl);

  public sendMessage(message: string) {
    this.socket.emit('message', message);
  }

  public getNewMessage = () => {
    this.socket.on('message', (message) =>{
      this.message$.next(message);
    });
    
    return this.message$.asObservable();
  };
}