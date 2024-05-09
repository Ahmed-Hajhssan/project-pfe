import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../shared/chat-service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  newMessage: string;
  messageList: string[] = [];

  constructor(private chatService: ChatService){
  }

  ngOnInit(){
    this.chatService.getNewMessage().subscribe((message: string) => {
      this.messageList.push(message);
      console.log('ngOnInit works !!')
    })
  }

  sendMessage() {
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
  }
}