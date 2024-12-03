import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {WebsocketService} from "../../services/websocket.service";
import {StatusService} from "../../services/status.service";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public ipAddress: string = "localhost"
  public port: string = "8080"
  public username: string = ""

  constructor(public webSocketService: WebsocketService,
              public statusService: StatusService) {
  }

  public connect(){
    const url: string = `ws://${this.ipAddress}:${this.port}`
    this.webSocketService.connect(url, this.username)
  }
}
