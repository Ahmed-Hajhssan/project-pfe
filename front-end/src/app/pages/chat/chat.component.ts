import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../shared/chat-service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatchMakingService } from '../../shared/match-making-service';
import { AuthService } from '../../shared/auth-service';
import { InvestorService } from '../../shared/investor-service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  role = localStorage.getItem('role')
  messages: any[] = [];
  message: string = "";
  receiverId: string = "";
  userId = localStorage.getItem('userId');
  messageSubscription: Subscription;
  convList:any[] = []
  image:string = 'assets/images/3da39-no-user-image-icon-27.webp'
  name:string;

  constructor(private chatService: ChatService,
    private actRoute: ActivatedRoute,
    private matchMakingService: MatchMakingService,
    public authService: AuthService,
    public investorService: InvestorService) {
   }

  ngOnInit(): void {
    this.getConvList()
  }
  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  scrollToBottom(): void {
    // Get the native DOM element of the scrollable div using getElementById
    const chatHistory = document.getElementById('chat-history');
    // Set the scroll position to the bottom
    if (chatHistory) {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  }

  public sendMessage(): void {
    if (this.message.trim() === '') {
      return; // Don't send empty messages
    }
    // Emit the message to the server
    this.chatService.sendMessage(this.userId||"", this.receiverId, this.message);
    this.message = "";
    setTimeout(() => {
      this.scrollToBottom();
    }, 5);
  }

  getConv(conv:any){
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.convList.forEach((conv)=>{
      conv.active = false;
    })
    conv.active = true;
    this.name=conv.name;
    this.image = 'assets/images/3da39-no-user-image-icon-27.webp';
    if (conv.image_profile)
      this.image='http://localhost:4000/api/uploads/' + conv.image_profile;
    this.receiverId=conv._id;
    const room = [this.userId,this.receiverId].sort().join(", ");
    this.chatService.connectToSocket(room)
    this.chatService.requestMessages(this.userId||"", this.receiverId);
    this.chatService.receiveMessage().subscribe((data: any) => {
      this.messages = data;
      console.log(this.messages);
      setTimeout(() => {
        this.scrollToBottom();
      }, 5);
    });
    this.messageSubscription = this.chatService.receiveMessages().subscribe((data: any) => {
      this.messages.push(data);
      setTimeout(() => {
        this.scrollToBottom();
      }, 5);
    });
  }

  getConvList(){
    let convList:any[] = [];
    this.matchMakingService.getUser(this.userId).subscribe((res) => {
      let matchmaking_list = res.matchmakings_list;
      if (this.role === "investor") {
        for (let id of matchmaking_list) {
          this.authService.getUser(id).subscribe(
            (user: any) => {
              convList.push(user);
            },
            (error: any) => {
              console.log(`Failed to retrieve user with ID ${id}`, error);
            }
          );
        }
        this.convList = convList;
        console.log('entrepreneurs list', this.convList)
      }else{
        for (let id of matchmaking_list) {
          this.investorService.getUser(id).subscribe(
            (user: any) => {
              convList.push(user);
            },
            (error: any) => {
              console.log(`Failed to retrieve user with ID ${id}`, error);
            }
          );
        }
        this.convList = convList;
        console.log('investors list', this.convList)
        
        
      }
      
      
    })

  }
}