import {Injectable} from '@angular/core';
import {WebSocketSubject} from "rxjs/internal/observable/dom/WebSocketSubject";
import {webSocket} from "rxjs/webSocket";
import {ClientMessage, MessageType, ServerMessage} from "../other/types";
import {StatusService} from "./status.service";
import {DrawService} from "./draw.service";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket!: WebSocketSubject<string>;

  constructor(public statusService: StatusService,
              public drawService: DrawService) {}

  public connect(url: string, username: string){
    this.socket = webSocket(url);

    this.socket.asObservable().subscribe(
      msg  => {
        const msg_: ServerMessage = JSON.parse(JSON.stringify(msg))
        console.log(msg_)
        switch(msg_.type){
          case MessageType.CONTROL:
            break;
          case MessageType.LOGIN:
            this.statusService.loggedIn = true
            this.statusService.loginFailed = false
            this.statusService.username = username
            break;
          case MessageType.ERROR:
            if(!this.statusService.loggedIn){
              this.statusService.loginFailed = true
            }

            this.statusService.statusString = msg_.content
            break;
          case MessageType.PLOT:
            console.log("test")
            this.drawService.draw(msg_.x,msg_.f_out,0)
            break;
            default:
            break;
        }
      },
      error => {
        this.statusService.loginFailed = true;
      }

    )

    this.send({
      type: MessageType.LOGIN,
      username: username,
      content: "",
      beginW: 0,
      endW: 0
    })
  }

  public send(msg: ClientMessage){
    this.socket.next(JSON.stringify(msg));
  }
}

