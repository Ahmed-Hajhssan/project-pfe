import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from 'express';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private socket: Socket;


  constructor(private http: HttpClient,private actRoute: ActivatedRoute) {

  }

  connectToSocket(roomName: string) {
    let senderId = localStorage.getItem('userId')
    this.socket = io('http://localhost:3000', { query: { roomName,senderId } });
  }

  getId(id : any) {
    this.receiveMessage = id;
  }

  sendMessage(senderId: string, receiverId: string, message: string) {
    this.socket.emit('sendMessage', { senderId, receiverId, message });
  }


  requestMessages(userId: string, otherUserId: string) {
    this.socket.emit('requestMessages', { userId, otherUserId });
  }

  receiveMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('requestedMessages', (messages: any) => {
        observer.next(messages);
      });
    });
  }

  receiveMessages(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('message', (messages: any) => {
        observer.next(messages);
      });
    });
  }

}