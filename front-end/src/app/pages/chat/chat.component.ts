import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../shared/chat-service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  message: string = "";
  receiverId: string = "";
  userId = localStorage.getItem('userId');
  private messageSubscription: Subscription;

  constructor(private chatService: ChatService,private actRoute: ActivatedRoute) {
   }

  ngOnInit(): void {
    this.receiverId=this.actRoute.snapshot.paramMap.get('id')||"";
    const room = [this.userId,this.receiverId].sort().join(", ");
    this.chatService.connectToSocket(room)
    this.chatService.requestMessages(this.userId||"", this.receiverId);
    this.messageSubscription = this.chatService.receiveMessage().subscribe((data: any) => {
      this.messages = data;
      console.log(this.messages);
    });
    this.messageSubscription = this.chatService.receiveMessages().subscribe((data: any) => {
      this.messages.push(data);
    });
  }
  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  public sendMessage(): void {
    if (this.message.trim() === '') {
      return; // Don't send empty messages
    }
    // Emit the message to the server
    this.chatService.sendMessage(this.userId||"", this.receiverId, this.message);
    this.message = "";
  }
}