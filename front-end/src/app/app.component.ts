import { Component, OnInit, Renderer2 } from '@angular/core';
import { AuthService } from './shared/auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] 
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false; 

  constructor(private authService: AuthService,private renderer: Renderer2,) {}

  ngOnInit(): void {
    this.authService.authenticateFromLocalStorage();
    this.isLoggedIn = this.authService.getIsAuthenticated();
    this.loadVoiceflowWidget();
  }

  loadVoiceflowWidget(): void {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
    script.onload = () => {
      (window as any).voiceflow.chat.load({
        verify: { projectID: '66494cb147a984053a7642e8' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production'
      });
    };
    this.renderer.appendChild(document.body, script);
  }
  
  title = 'front-end';
}

