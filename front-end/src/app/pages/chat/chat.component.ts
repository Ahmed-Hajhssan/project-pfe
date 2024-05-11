import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../shared/chat-service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  public message: string;
  public messages: string[] = [];

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.getMessages().subscribe((message: string) => {
      this.messages.push(message);
    });
  }

  public sendMessage(): void {
    this.chatService.sendMessage(this.message);
    this.message = '';
  }
}